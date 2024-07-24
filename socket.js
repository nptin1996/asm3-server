let io;

module.exports = {
  init: (httpServer) => {
    io = require("socket.io")(httpServer, {
      cors: {
        origin: [
          process.env.CLIENT_URL,
          process.env.ADMIN_URL || "http://localhost:3001",
        ],
      },
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not init");
    }
    return io;
  },
};
