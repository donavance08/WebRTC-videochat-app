import * as wss from './wss.js';
import * as constants from './constants.js';
import * as ui from './ui.js';
import * as store from './store.js';

let connectedUserDetails;
let peerConnection;

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

  peerConnection.onicecandidate = (event) => {
    console.log('getting ice candidates from stun server');
    if (event.candidate) {
      //send our ice candidates to other peer
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

export const handWebRTCOffer = (data) => {
  console.log('webRTCHandler.webRTCOffer called');
  console.log('data', data);
};
