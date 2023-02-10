import * as store from './store.js';
import * as ui from './ui.js';
import * as webRTCHandler from './webRTCHandler.js';
import * as constants from './constants.js';

let socketIO = null;

export const registerSocketEvents = (socket) => {
  console.log('calling registerSocketEvents function');
  console.log('socket', socket);
  socketIO = socket;

  socket.on('connect', () => {
    console.log('successfully connected to socket.io server');
    store.setSocketId(socket.id);
    ui.updatePersonalCode(socket.id);
  });

  socket.on('pre-offer', (data) => {
    console.log('pre-offer-event triggered');
    webRTCHandler.handlePreOffer(data);
  });

  socket.on('pre-offer-answer', (data) => {
    console.log('pre-offer-asnwer listener triggered');
    webRTCHandler.handlePreOfferAnswer(data);
  });

  socket.on('webRTC-signalling', (data) => {
    switch (data.type) {
      case constants.webRTCSignalling.OFFER:
        webRTCHandler.handWebRTCOffer(data);
        break;
      case constants.webRTCSignalling.ANSWER:
        webRTCHandler.handleWebRTCAnswer(data);
        break;
      case constants.webRTCSignalling.ICE_CANDIDATE:
        webRTCHandler.handleWebRTCCandidate(data);
        break;
      default:
        return;
    }
  });

  socket.on('user-hanged-up', () => {
    webRTCHandler.handleConnectedUserHangedUp();
  });
};

export const sendPreOffer = (data) => {
  socketIO.emit('pre-offer', data);
};

export const sendPreOfferAnswer = (data) => {
  socketIO.emit('pre-offer-answer', data);
};

export const sendDataUsingWebRTCSignalling = (data) => {
  socketIO.emit('webRTC-signalling', data);
};

export const sendUserHangedUp = (data) => {
  socketIO.emit('user-hanged-up', data);
};
