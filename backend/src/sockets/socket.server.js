const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

function initializeSocketServer(httpServer) {
  const io = new Server(httpServer, {});

  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
    // console.log("Socket handshake cookies:", cookies);

    if (!cookies.token) {
    //   console.log("No cookies found in the handshake with socketio.");
      return next(new Error("Authentication error: No cookies found"));
    }

    try {
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);

      socket.user = user;
      next();
    } catch (error) {
    //   console.log("Error verifying JWT token:", error);
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Authenticated user:", socket.user);
    console.log("New socket connection:", socket.id);

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });
}

module.exports = {
  initializeSocketServer,
};
