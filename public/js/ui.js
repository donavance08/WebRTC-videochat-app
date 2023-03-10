import * as constants from './constants.js';
import * as elements from './elements.js';
import { setScreenSharingActive } from './store.js';

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

export const showVideoCallButtons = () => {
  const personalCodeVideoButton = document.getElementById(
    'personal_code_video_button'
  );
  showElement(personalCodeVideoButton);
  const strangerVideoButton = document.getElementById('stranger_video_button');

  showElement(strangerVideoButton);
};

// Update the source of remote_video to the stream.
export const updateRemoteVideo = (stream) => {
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

export const showNoStrangerAvailableDialog = () => {
  const infoDialog = elements.getInfoDialog(
    'No Stranger Available',
    'Please try again later!'
  );

  if (infoDialog) {
    const dialog = document.getElementById('dialog');
    dialog.appendChild(infoDialog);

    setTimeout(() => {
      removeAllDialogs();
    }, 4000);
  }
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

export const showCallElements = (callType) => {
  if (
    callType === constants.callType.CHAT_PERSONAL_CODE ||
    callType === constants.callType.CHAT_STRANGER
  ) {
    showChatCallElements(callType);
    return;
  }

  if (
    callType === constants.callType.VIDEO_PERSONAL_CODE ||
    callType === constants.callType.VIDEO_STRANGER
  ) {
    showVideoCallElements(callType);
  }
};

const showChatCallElements = (callType) => {
  const finishConnectionChatButtonContainer = document.getElementById(
    'finish_chat_button_container'
  );
  showElement(finishConnectionChatButtonContainer);

  const newMessageInput = document.getElementById('new_message');
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

// ui messages
export const appendMessage = (message, right = false) => {
  const messagesContainer = document.getElementById('messages_container');
  const messageElement = right
    ? elements.getRightMessage(message)
    : elements.getLeftMessage(message);

  messagesContainer.appendChild(messageElement);
};

export const clearMessenger = () => {
  const messagesContainer = document.getElementById('messages_container');
  messagesContainer.querySelectorAll('*').forEach((n) => {
    n.remove();
  });
};

//recording

export const showRecordingPanel = () => {
  const recordingButtons = document.getElementById('video_recording_buttons');
  showElement(recordingButtons);

  // hide Start recording button if it is active
  const startRecordingButton = document.getElementById(
    'start_recording_button'
  );

  hideElement(startRecordingButton);
};

export const resetRecordingButtons = () => {
  const startRecordingButton = document.getElementById(
    'start_recording_button'
  );
  const recordingButtons = document.getElementById('video_recording_buttons');

  showElement(startRecordingButton);
  hideElement(recordingButtons);
};

export const switchRecordingButtons = (switchForResumeButton = false) => {
  const resumeButton = document.getElementById('resume_recording_button');
  const pauseButton = document.getElementById('pause_recording_button');

  if (switchForResumeButton) {
    hideElement(pauseButton);
    showElement(resumeButton);
  } else {
    hideElement(resumeButton);
    showElement(pauseButton);
  }
};

export const updateUIAfterHangUp = (callType) => {
  enableDashboard();

  if (
    callType === constants.callType.VIDEO_PERSONAL_CODE ||
    callType === constants.callType.VIDEO_STRANGER
  ) {
    const callButtons = document.getElementById('call_buttons');
    hideElement(callButtons);
  } else {
    const chatCallButtons = document.getElementById(
      'finish_chat_button_container'
    );
    hideElement(chatCallButtons);
  }

  const newMessageInput = document.getElementById('new_message');
  hideElement(newMessageInput);
  clearMessenger();

  updateMicButton(false);
  updateCameraButton(false);

  //hide remove video and show placeholder
  const placeholder = document.getElementById('video_placeholder');
  showElement(placeholder);

  const remoteVideo = document.getElementById('remote_video');
  hideElement(remoteVideo);

  removeAllDialogs();
};

// changing status of checkbox
export const updateStrangerCheckbox = (allowConnections) => {
  const checkboxCheckImg = document.getElementById(
    'allow_strangers_checkbox_image'
  );
  allowConnections
    ? showElement(checkboxCheckImg)
    : hideElement(checkboxCheckImg);
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
