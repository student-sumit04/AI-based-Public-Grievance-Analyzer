let socketServer = null;

export function setSocketServer(io) {
  socketServer = io;
}

export function emitToRoom(room, event, payload) {
  if (socketServer) {
    socketServer.to(room).emit(event, payload);
  }
}
