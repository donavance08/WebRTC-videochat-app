import * as wss from './wss.js';
import * as constants from './constants.js';
import * as ui from './ui.js';
import * as store from './store.js';

let connectedUserDetails;
let peerConnection;
let dataChannel;

const defaultConstraints = {
  audio: true,
  video: true,
};

const configuration = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:13902',
    },
  ],
};

/**
 * function to gain access to camera and microphone and preview it to the local_video container
 */
export const getLocalPreview = () => {
  console.log('webRTCHandler.getLocalPreview called');
  navigator.mediaDevices
    .getUserMedia(defaultConstraints)
    .then((stream) => {
      ui.updateLocalVideo(stream);
      store.setLocalStream(stream);
      console.log('localStream', store.getState().localStream);
    })
    .catch((error) => {
      console.log('error occured whe trying to get access to camera');
      console.log(error);
    });
};

const createPeerConnection = () => {
  console.log('ui.createPerrConnection called');
  peerConnection = new RTCPeerConnection(configuration);

  // create data channel for chat functionality
  dataChannel = peerConnection.createDataChannel('chat');

  // create a ondatachannel listener
  peerConnection.ondatachannel = (event) => {
    const dataChannel = event.channel;

    dataChannel.onopen = () => {
      console.log('peer connection is ready to recieve data channel messages');
    };

    dataChannel.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('message', message);
      // TODO: new message handler

      ui.appendMessage(message);
    };
  };

  peerConnection.onicecandidate = (event) => {
    console.log('getting ice candidates from stun server');
    if (event.candidate) {
      //send our ice candidates to other peer
      wss.sendDataUsingWebRTCSignalling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRTCSignalling.ICE_CANDIDATE,
        candidate: event.candidate,
      });
    }
  };

  peerConnection.onconnectionstatechange = (event) => {
    if (peerConnection.connectionState === 'connected') {
      console.log('succesfully connected with other peer');
    }
  };

  // recieving tracks
  const remoteStream = new MediaStream();
  store.setRemoteStream(remoteStream);
  ui.updateRemoteVideo(remoteStream);

  peerConnection.ontrack = (event) => {
    remoteStream.addTrack(event.track);
  };

  // add our stream to peer connection
  if (
    connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE
  ) {
    const localStream = store.getState().localStream;
    for (const track of localStream.getTracks()) {
      peerConnection.addTrack(track, localStream);
    }
  }
};

export const sendMessageUsingDataChannel = (message) => {
  const stringifiedMessage = JSON.stringify(message);
  dataChannel.send(stringifiedMessage);
};

/**
 * determines if call or chat is for a stranger or a known contact and lets wss handle the preoffer event
 */
export const sendPreOffer = (callType, calleePersonalCode) => {
  // saving the callee details
  connectedUserDetails = {
    callType,
    socketId: calleePersonalCode,
  };

  if (
    callType === constants.callType.CHAT_PERSONAL_CODE ||
    callType === constants.callType.VIDEO_PERSONAL_CODE
  ) {
    const data = {
      callType,
      calleePersonalCode,
    };

    ui.showCallingDialog(callingDialogRejectCallHandler);
    wss.sendPreOffer(data);
  }
};

export const handlePreOffer = (data) => {
  const { callType, callerSocketId } = data;

  connectedUserDetails = {
    socketId: callerSocketId,
    callType,
  };

  if (
    callType === constants.callType.CHAT_PERSONAL_CODE ||
    callType === constants.callType.VIDEO_PERSONAL_CODE
  ) {
    ui.showIncomingCallDialog(callType, acceptCallHandler, rejectCallHandler);
  }
};

const acceptCallHandler = () => {
  console.log('call accepted');
  createPeerConnection();
  sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
  ui.showVideoCallElements(connectedUserDetails.callType);
};
const rejectCallHandler = () => {
  console.log('call rejected');
  sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED);
};

const callingDialogRejectCallHandler = () => {};

const sendPreOfferAnswer = (preOfferAnswer) => {
  const data = {
    callerSocketId: connectedUserDetails.socketId,
    preOfferAnswer,
  };

  ui.removeAllDialogs();
  wss.sendPreOfferAnswer(data);
};

export const handlePreOfferAnswer = (data) => {
  console.log('handlePreOfferAnswer called');
  const { preOfferAnswer } = data;

  ui.removeAllDialogs();

  switch (preOfferAnswer) {
    case constants.preOfferAnswer.CALLEE_NOT_FOUND:
      //show dialog that callee not found
      ui.showInfoDialog(preOfferAnswer);
      break;

    case constants.preOfferAnswer.CALL_UNAVAILABLE:
      ui.showInfoDialog(preOfferAnswer);
      break;

    case constants.preOfferAnswer.CALL_REJECTED:
      console.log('webRTCHandler: case CALL_REJECTED');
      ui.showInfoDialog(preOfferAnswer);
      break;

    case constants.preOfferAnswer.CALL_ACCEPTED:
      console.log('webRTCHandler: case CALL_ACCEPTED');
      ui.showVideoCallElements(connectedUserDetails.callType);
      createPeerConnection();
      sendWebRTCOffer();
  }
};

const sendWebRTCOffer = async () => {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  wss.sendDataUsingWebRTCSignalling({
    connectedUserSocketId: connectedUserDetails.socketId,
    type: constants.webRTCSignalling.OFFER,
    offer: offer,
  });
};

// respond to the webRTCOffer
export const handWebRTCOffer = async (data) => {
  await peerConnection.setRemoteDescription(data.offer);

  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  wss.sendDataUsingWebRTCSignalling({
    connectedUserSocketId: connectedUserDetails.socketId,
    type: constants.webRTCSignalling.ANSWER,
    answer: answer,
  });
};

// function used by the caller once it recieves and answer
export const handleWebRTCAnswer = async (data) => {
  console.log('webRTCHandler.handleWebRTCAnswer called');

  await peerConnection.setRemoteDescription(data.answer);
};

// function to send ICE candidate to peer
export const handleWebRTCCandidate = async (data) => {
  try {
    await peerConnection.addIceCandidate(data.candidate);
  } catch (error) {
    console.error(
      'error occurred when trying to add recieved ice candidate',
      err
    );
  }
};

/**
 * handle click for screensharing button
 * @param {boolean}screenSharingActive - status of screensharing button
 */

let screenSharingStream;

export const switchBetweenCameraAndScreenSharing = async (
  screenSharingActive
) => {
  if (screenSharingActive) {
    const localStream = store.getState().localStream;

    const senders = peerConnection.getSenders();

    const sender = senders.find(
      (sender) =>
        sender.track.kind === screenSharingStream.getVideoTracks()[0].kind
    );

    if (sender) {
      sender.replaceTrack(localStream.getVideoTracks()[0]);
    }

    // stop screen sharing stream
    store
      .getState()
      .screenSharingStream.getTracks()
      .forEach((track) => track.stop());

    store.setScreenSharingActive(!screenSharingActive);
    ui.updateLocalVideo(localStream);
  } else {
    console.log('switching from screen sharing ');
    try {
      screenSharingStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      store.setScreenSharingStream(screenSharingStream);

      //replace track which sender is sending
      const senders = peerConnection.getSenders();

      const sender = senders.find(
        (sender) =>
          sender.track.kind === screenSharingStream.getVideoTracks()[0].kind
      );

      if (sender) {
        sender.replaceTrack(screenSharingStream.getVideoTracks()[0]);
      }

      store.setScreenSharingActive(!screenSharingActive);

      ui.updateLocalVideo(screenSharingStream);
    } catch (error) {
      console.error('screensharing encountered an error');
      console.log(error.message);
    }
  }
};

// function to handle a call or chat hangup
export const handleHangUp = () => {
  console.log('initiate end call or chat');
  const data = {
    connectedUserSocketId: connectedUserDetails.socketId,
  };

  wss.sendUserHangedUp(data);
};

//function to handle a connected user hanging up
export const handleConnectedUserHangedUp = () => {
  console.log('connected peer hanged up');
};
