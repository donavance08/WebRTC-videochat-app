const express = require('express');
const http = require('http');
const { reset } = require('nodemon');
require('dotenv').config();
const twilio = require('twilio');

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

app.use(express.static('./public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
app.get('/api/get-turn-credentials', (req, res) => {

  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

  client.tokens
    .create()
    .then((token) => res.send({ token }))
    .catch((error) => {
      console.log(error);
      res.send({ message: 'failed to fetch TURN credentials', error });
    });
});

let connectedPeers = [];
let connectedPeersStrangers = [];

/* 
    Make socket listen for connection event and inform the user
    print the socket.id afterwards
*/
io.on('connection', (socket) => {
  connectedPeers.push(socket.id);

  /* *
   * Listen for pre-offer events comming from each client connected to this socket server and notify the connected socket if it is online, or reply with an error if not.
   */
  socket.on('pre-offer', (data) => {
    const { calleePersonalCode, callType } = data;

    const connectedPeer = connectedPeers.find((peerSocketId) => {
      return peerSocketId === calleePersonalCode;
    });

    if (connectedPeer) {
      data = {
        callerSocketId: socket.id,
        callType,
      };

      io.to(calleePersonalCode).emit('pre-offer', data);
    } else {
      const data = {
        preOfferAnswer: 'CALLEE_NOT_FOUND',
      };
      io.to(socket.id).emit('pre-offer-answer', data);
    }
  });

  socket.on('pre-offer-answer', (data) => {
    const { callerSocketId, preOfferAnswer } = data;

    const connectedPeer = connectedPeers.find((peerSocketId) => {
      return peerSocketId === callerSocketId;
    });

    if (connectedPeer) {
      io.to(callerSocketId).emit('pre-offer-answer', data);
    }
  });

  socket.on('webRTC-signalling', (data) => {
    const { connectedUserSocketId } = data;

    const connectedPeer = connectedPeers.find(
      (peerSocketId) => peerSocketId === connectedUserSocketId
    );

    if (connectedPeer) {
      io.to(connectedPeer).emit('webRTC-signalling', data);
    }
  });

  socket.on('user-hanged-up', (data) => {
    const { connectedUserSocketId } = data;

    const connectedPeer = connectedPeers.find(
      (peerSocketId) => peerSocketId === connectedUserSocketId
    );

    if (connectedPeer) {
      io.to(connectedUserSocketId).emit('user-hanged-up');
    }
  });

  socket.on('disconnect', () => {
    // delete disconnected socket from the connectedPeers array
    const indexOfPeers = connectedPeers.indexOf(socket.id);
    if (indexOfPeers >= 0) {
      connectedPeers.splice(indexOfPeers, 1);
    }

    // delete disconnected socket from the connectedPeersStrangers array
    const indexOfStrangers = connectedPeersStrangers.indexOf(socket.id);
    if (indexOfStrangers >= 0) {
      connectedPeersStrangers.splice(indexOfStrangers, 1);
    }
  });

  socket.on('stranger-connection-status', (data) => {
    const { status } = data;
    if (status) {
      connectedPeersStrangers.push(socket.id);
    } else {
      const indexOfStrangers = connectedPeersStrangers.indexOf(socket.id);
      if (indexOfStrangers >= 0) {
        connectedPeersStrangers.splice(indexOfStrangers, 1);
      }
    }
  });

  socket.on('get-stranger-socket-id', () => {
    let randomStrangerSocketId;

    const filteredConnectedPeersStrangers = connectedPeersStrangers.filter(
      (peerSocketId) => peerSocketId !== socket.id
    );

    if (filteredConnectedPeersStrangers.length > 0) {
      randomStrangerSocketId =
        filteredConnectedPeersStrangers[
          Math.floor(Math.random() * filteredConnectedPeersStrangers.length)
        ];
    } else {
      randomStrangerSocketId = null;
    }

    const data = {
      randomStrangerSocketId,
    };

    io.to(socket.id).emit('stranger-socket-id', data);
  });
});

server.listen(PORT, () => console.log(`Server is online on port ${PORT}`));
