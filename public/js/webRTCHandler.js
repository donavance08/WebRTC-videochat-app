import * as wss from './wss.js';
import * as constants from './constants.js';
import * as ui from './ui.js';

let connectedUserDetails;

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
  sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
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
      ui.showInfoDialog(preOfferAnswer);
      console.log('webRTCHandler: case CALL_ACCEPTED');
      break;
  }
};
