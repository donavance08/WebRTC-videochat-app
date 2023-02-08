import * as store from './store.js';
import * as wss from './wss.js';
import * as webRTCHandler from './webRTCHandler.js';
import * as constants from './constants.js';

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
