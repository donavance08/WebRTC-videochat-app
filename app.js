const express = require('express');
const http = require('http');
require('dotenv').config();
const { printConnectedSockets } = require('./public/js/bin');

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

app.use(express.static('./public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

let connectedPeers = [];
/* 
    Make socket listen for connection event and inform the user
    print the socket.id afterwards
*/
io.on('connection', (socket) => {
  console.log(`New socket detected ${socket.id}$`);
  connectedPeers.push(socket.id);

  printConnectedSockets(connectedPeers);

  /* *
   * Listen for pre-offer events comming from each client connected to this socket server and emit same event name to the destination socket.
   */
  socket.on('pre-offer', (data) => {
    console.log('server pre-offer listener triggered');
    const { calleePersonalCode, callType } = data;

    const connectedPeer = connectedPeers.find((peerSocketId) => {
      return peerSocketId === calleePersonalCode;
    });

    if (connectedPeer) {
      console.log('found in list');
      const data = {
        callerSocketId: socket.id,
        callType,
      };

      io.to(calleePersonalCode).emit('pre-offer', data);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected from the server`);

    // delete disconnected socket from the connectedPeers array
    connectedPeers.splice(connectedPeers.indexOf(socket.id), 1);

    printConnectedSockets(connectedPeers);
  });
});

server.listen(PORT, () => console.log(`Server is online on port ${PORT}`));