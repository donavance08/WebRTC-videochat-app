const express = require('express');
const http = require('http');
require('dotenv').config();

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
  console.log(`User ${socket.id} connected to the server`);

  connectedPeers.push(socket);

  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected from the server`);
  });
});

server.listen(PORT, () => console.log(`Server is online on port ${PORT}`));
