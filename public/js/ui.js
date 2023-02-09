import * as constants from './constants.js';
import * as elements from './elements.js';

export const updatePersonalCode = (personalCode) => {
  const personalCodeParagraph = document.getElementById(
    'personal_code_paragraph'
  );
  personalCodeParagraph.innerHTML = personalCode;
};

export const updateLocalVideo = (stream) => {
  const localVideo = document.getElementById('local_video');
  localVideo.srcObject = stream;

  localVideo.addEventListener('loadedmetadata', () => {
    localVideo.play();
  });
};

// Update the source of remote_video to the stream.
export const updateRemoteVideo = (stream) => {
  console.log('ui.updateRemoteVideo called');
  const remoteVideo = document.getElementById('remote_video');
  remoteVideo.srcObject = stream;
};

export const showIncomingCallDialog = (
  callType,
  acceptCallHandler,
  rejectCallHandler
) => {
  const callTypeInfo =
    callType === constants.callType.CHAT_PERSONAL_CODE ? 'Chat' : 'Video';

  const incomingCallDialog = elements.getIncomingDialog(
    callTypeInfo,
    acceptCallHandler,
    rejectCallHandler
  );

  // Removing all dialogs inside HTML dialog element
  const dialog = document.getElementById('dialog');
  dialog.querySelectorAll('*').forEach((dialog) => dialog.remove());

  dialog.appendChild(incomingCallDialog);
};

export const showCallingDialog = (rejectCallHandler) => {
  const callingDialog = elements.getCallingDialog(rejectCallHandler);

  // Removing all dialogs inside HTML dialog element
  const dialog = document.getElementById('dialog');
  dialog.querySelectorAll('*').forEach((dialog) => dialog.remove());

  dialog.appendChild(callingDialog);
};

export const removeAllDialogs = () => {
  const dialog = document.getElementById('dialog');
  dialog.querySelectorAll('*').forEach((dialog) => dialog.remove());
};

/**
 *
 * @param {*} preOfferAnswer
 *
 * Function will assign different responses depending on the preOfferAnswer and show it on a dialog box by calling elements.getInfoDialog()
 */
export const showInfoDialog = (preOfferAnswer) => {
  let infoDialog = null;

  switch (preOfferAnswer) {
    case constants.preOfferAnswer.CALL_REJECTED:
      infoDialog = elements.getInfoDialog(
        'Call rejected',
        'Callee rejected your call'
      );
      break;

    case constants.preOfferAnswer.CALLEE_NOT_FOUND:
      infoDialog = elements.getInfoDialog(
        'Callee not found',
        'Please check personal code'
      );
      break;

    case constants.preOfferAnswer.CALL_UNAVAILABLE:
      infoDialog = elements.getInfoDialog(
        'Call is not possible',
        'Please try again later'
      );
      break;
  }

  if (infoDialog) {
    const dialog = document.getElementById('dialog');
    dialog.appendChild(infoDialog);

    setTimeout(() => {
      removeAllDialogs();
    }, 4000);
  }
};

export const showChatCallElements = (callType) => {
  const finishConnectionChatButtonContainer = document.getElementById(
    'finish_chat_button_container'
  );
  showElement(newMessageInput);

  disableDashboard();
};

export const showVideoCallElements = (callType) => {
  const callButtons = document.getElementById('call_buttons');
  showElement(callButtons);

  const placeholder = document.getElementById('video_placeholder');
  hideElement(placeholder);

  const remoteVideo = document.getElementById('remote_video');
  showElement(remoteVideo);

  const newMessageInput = document.getElementById('new_message');
  showElement(newMessageInput);

  disableDashboard();
};

// call control functions

/**
 * function to change micButtonImage depending on status of the microphone
 * @param {boolean} micEnabled - status of the microphone
 */
export const updateMicButton = (micEnabled) => {
  console.log('ui.updateMicButton called');

  const micONImgSrc = './utils/images/mic.png';
  const micOffImgSrc = './utils/images/micOff.png';

  const micButtonImage = document.getElementById('mic_button_image');
  micButtonImage.src = micEnabled ? micOffImgSrc : micONImgSrc;
};

/**
 * function to change cameraButtonImage depending on status of the camera
 * @param {boolean} cameraEnabled - status of the camera
 */
export const updateCameraButton = (cameraEnabled) => {
  const cameraOnImgSrc = './utils/images/camera.png';
  const cameraOffImgSrc = './utils/images/cameraOff.png';

  const cameraButtonImage = document.getElementById('camera_button_image');
  cameraButtonImage.src = cameraEnabled ? cameraOffImgSrc : cameraOnImgSrc;
};

// ui helper functions
const enableDashboard = () => {
  const dashboardBlocker = document.getElementById('dashboard_blur');
  if (!dashboardBlocker.classList.contains('display_none')) {
    dashboardBlocker.classList.add('display_none');
  }
};

const disableDashboard = () => {
  const dashboardBlocker = document.getElementById('dashboard_blur');
  if (dashboardBlocker.classList.contains('display_none')) {
    dashboardBlocker.classList.remove('display_none');
  }
};

const hideElement = (element) => {
  if (!element.classList.contains('display_none')) {
    element.classList.add('display_none');
  }
};

const showElement = (element) => {
  if (element.classList.contains('display_none')) {
    element.classList.remove('display_none');
  }
};
