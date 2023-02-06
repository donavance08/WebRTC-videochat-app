const socket = io('/');

socket.on('connect', () => {
  console.log('successfully connected to socket.io server');
});
