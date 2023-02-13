import * as wss from './wss.js';
import * as webRTCHandler from './webRTCHandler'

let strangerCallType;

export const changeStrangerConnectionStatus = (status) => {
  const data = { status };
  wss.changeStrangerConnectionStatus(data);
};

export const getStrangerSocketIdAndConnect = (callType) => {
  strangerCallType = callType;
  wss.getStrangerSocketId();
};

export const connectWithStranger = (data) => {
  console.log(data.randomStrangerSocketId);

  if(data.randomStrangerSocketId){
    webRTCHandler.sendPreOffer(strangerCallType, data.randomStrangerSocketId)
  } else {
    // no user avaialble
  }

};
