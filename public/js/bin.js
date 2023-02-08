module.exports.printConnectedSockets = (socketIds) => {
  console.log('');
  console.log('Sockets online:');
  socketIds.forEach((socketId) => console.log(socketId));
  console.log()
};
