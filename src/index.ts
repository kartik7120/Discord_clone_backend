import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";
import joinRoom from "./interfaces";
dotenv.config();
const app = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*"
    }
});
app.get("/", (req, res) => {
    res.send("Hello World");
})
const numeberOfClients = io.engine.clientsCount;
console.log("Number of sockets connected to io socket = ", numeberOfClients);
io.on("connection", (socket) => {
    const clientsCountMain = io.of("/").sockets.size;
    console.log("Number of clients in the main namespace = ", clientsCountMain);
    console.log("Socket connected to main namespace");
    console.log(socket.rooms);
    console.log(socket.id);
    socket.on("disconnect", (reason: string) => {
        console.log(`socket ${socket.id} disconnected , reason = ${reason}`);
    })
    socket.on("joinRoom", (arg: joinRoom, callback) => {
        const socketRoomArray = socket.rooms;
        const id = socket.id;
        for (let room of socketRoomArray) {
            if (room !== id)
                socket.leave(room);
        }
        const roomName = arg.roomName;
        socket.join(roomName);
        console.log(socket.rooms);
        callback(`Joined room ${roomName}`);
    })
    socket.on("message", (message: string, channelName: string) => {
        console.log("Recieved message from the frontend = ", message);
        socket.to(channelName).emit("messages", message);
    })
})

httpServer.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
})