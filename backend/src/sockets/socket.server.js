const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../services/ai.service");
const messageModel = require("../models/message.model");

function initializeSocketServer(httpServer) {
  const io = new Server(httpServer, {});

  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
    console.log("Socket handshake cookies:", cookies);

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
    // console.log("Authenticated user:", socket.user);
    // console.log("New socket connection:", socket.id);

    // socket.on("disconnect", () => {
    //   console.log("A user disconnected:", socket.id);
    // });

    socket.on("ai-message", async (messagePayload) => {
      console.log("Received ai-message event:", messagePayload);

      await messageModel.create({
        user: socket.user._id,
        chat: messagePayload.chat,
        content: messagePayload.content,
        role: "user_input",
      });

      const chatHistory = await messageModel.find({
        chat: messagePayload.chat,
      }).sort({ createdAt: -1 }).limit(10).lean().exec();

      // console.log(
      //   "chatHistory :",
      //   chatHistory.map((item) => {
      //     return {
      //      type: item.role,
      //      content: [
      //        {
      //           type: "text",
      //           text: item.content,
      //        },
      //      ],
      //     };
      //   }),
      // );

      try {
        const aiResponse = await aiService.generateAIResponse(
          chatHistory.map((item) => {
            return {
              type: item.role,
              content: [
                {
                  type: "text",
                  text: item.content,
                },
              ],
            };
          }),
        );
        console.log("AI response generated:", aiResponse);

        await messageModel.create({
          user: socket.user._id,
          chat: messagePayload.chat,
          content: aiResponse,
          role: "model_output",
        });

        socket.emit("ai-response", {
          content: aiResponse,
          chat: messagePayload.chat,
        });
      } catch (error) {
        console.error("Error generating AI response:", error);
        socket.emit("ai-response-error", {
          error: "Failed to generate AI response",
        });
      }
    });
  });
}

module.exports = {
  initializeSocketServer,
};
