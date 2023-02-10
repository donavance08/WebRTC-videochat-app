import * as store from './store.js';
import * as wss from './wss.js';
import * as webRTCHandler from './webRTCHandler.js';
import * as constants from './constants.js';
import * as ui from './ui.js';
import * as recordingUtils from './recordingUtils.js';

// initialize socket
const socket = io();
wss.registerSocketEvents(socket);

webRTCHandler.getLocalPreview();

// implement a copy button functionality
const personalCodeCopyButton = document.getElementById(
  'personal_code_copy_button'
);

personalCodeCopyButton.addEventListener('click', (event) => {
  const personalCode = store.getState().socketId;
  navigator.clipboard && navigator.clipboard.writeText(personalCode);
});

// register event listeners for connection buttons

const personalCodeChatButton = document.getElementById(
  'personal_code_chat_button'
);

personalCodeChatButton.addEventListener('click', () => {
  console.log('chat button clicked');
  const personalCode = document.getElementById('personal_code_input').value;
  const callType = constants.callType.CHAT_PERSONAL_CODE;

  webRTCHandler.sendPreOffer(callType, personalCode);
});

const personalCodeVideoButton = document.getElementById(
  'personal_code_video_button'
);

personalCodeVideoButton.addEventListener('click', () => {
  console.log('video button clicked');
  const personalCode = document.getElementById('personal_code_input').value;
  const callType = constants.callType.VIDEO_PERSONAL_CODE;

  webRTCHandler.sendPreOffer(callType, personalCode);
});

//event listener for microphone button
const micButton = document.getElementById('mic_button');
console.log('micButton', micButton);

micButton.addEventListener('click', () => {
  console.log('micButton eventlistener triggered');

  const localStream = store.getState().localStream;
  const micEnabled = localStream.getAudioTracks()[0].enabled;
  localStream.getAudioTracks()[0].enabled = !micEnabled;

  ui.updateMicButton(micEnabled);
});

//event listener to toggle camera on/off
const cameraButton = document.getElementById('camera_button');

cameraButton.addEventListener('click', () => {
  console.log('cameraButton evenListener triggered');
  const localStream = store.getState().localStream;
  const cameraEnabled = localStream.getVideoTracks()[0].enabled;
  localStream.getVideoTracks()[0].enabled = !cameraEnabled;
  ui.updateCameraButton(cameraEnabled);
});

// event listener for screen sharing button
const screenSharingButton = document.getElementById('screen_sharing_button');

screenSharingButton.addEventListener('click', () => {
  const screenSharingActive = store.getState().screenSharingActive;
  webRTCHandler.switchBetweenCameraAndScreenSharing(screenSharingActive);
});

//event listener for messenger

const newMessageInput = document.getElementById('new_message_input');
newMessageInput.addEventListener('keydown', (event) => {
  console.log('change occured');
  const key = event.key;

  if (key === 'Enter') {
    webRTCHandler.sendMessageUsingDataChannel(event.target.value);
    ui.appendMessage(event.target.value, true);
    newMessageInput.value = '';
  }
});

const sendMessageButton = document.getElementById('send_message_button');

sendMessageButton.addEventListener('click', (event) => {
  const message = newMessageInput.value;
  webRTCHandler.sendMessageUsingDataChannel(newMessageInput.value);
  ui.appendMessage(message, true);
  newMessageInput.value = '';
});

// recording

const startRecordingButton = document.getElementById('start_recording_button');

startRecordingButton.addEventListener('click', () => {
  recordingUtils.startRecording();
  ui.showRecordingPanel();
});

const stopRecordingButton = document.getElementById('stop_recording_button');
stopRecordingButton.addEventListener('click', () => {
  recordingUtils.stopRecording();
  ui.resetRecordingButtons();
});

// event listener for pause recording button
const pauseRecordingButton = document.getElementById('pause_recording_button');
pauseRecordingButton.addEventListener('click', () => {
  recordingUtils.pauseRecording();
  ui.switchRecordingButtons(true);
});

// event listener for resume recoding button
const resumeRecordingButton = document.getElementById(
  'resume_recording_button'
);
resumeRecordingButton.addEventListener('click', () => {
  recordingUtils.resumeRecording();
  ui.switchRecordingButtons();
});

// event listener for hanging up video call button
const hangUpButton = document.getElementById('hang_up_button');
hangUpButton.addEventListener('click', () => {
  webRTCHandler.handleHangUp();
});

// event listener for hangin up chat
const hangUpChatButton = document.getElementById('finish_chat_call_button');
hangUpButton.addEventListener('click', () => {
  webRTCHandler.handleHangUp();
});
