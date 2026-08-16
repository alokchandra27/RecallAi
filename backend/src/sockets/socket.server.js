const {Server} = require("socket.io");


function initializeSocketServer(httpServer) {
    const io = new Server(httpServer,{});

    io.on("connection", (socket) => {
        console.log("New socket connection:", socket.id);

        socket.on("disconnect", () => {
            console.log("A user disconnected:", socket.id);
        });

    });
}

module.exports = {
    initializeSocketServer,
};