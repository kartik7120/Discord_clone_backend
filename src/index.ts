import express, { urlencoded } from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";
import joinRoom from "./interfaces";
import axios from "axios";
import mongoose from "mongoose";
import router from "./routes/namespace.js";
debugger;
mongoose.connect('mongodb://localhost:27017/Discord')
    .then(() => {
        console.log("Connected to MongoDB database");
    }).catch((err) => {
        console.log(`Error occured while connecting to the Mongo DB database = ${err}`)
    })
dotenv.config();
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.raw({ limit: "50mb" }));
app.use(cors());
app.use("/namespace", router);
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*"
    }
});
app.get("/", (req, res) => {
    res.send("Hello World");
})
io.use((socket, next) => {
    let handshake = socket.handshake;
    socket.data = handshake.auth;
    next();
})
io.on("connection", async (socket) => {
    const namespace = socket.nsp.name;
    const sockets = await io.of(namespace).fetchSockets();
    console.log(`socket id = ${socket.id} in ${namespace} namespace`);
    const numeberOfClients = io.of(namespace).sockets.size;
    const ioNumberOfClients = io.engine.clientsCount;
    console.log(`Number of sockets connecteed in ${namespace} namespace = ${numeberOfClients}`);
    socket.on("joinRoom", async (arg: joinRoom, callback) => {
        socket.data = {
            userSub: arg.userSub,
            userName: arg.userName,
            userPicture: arg.userPicture
        }
        const socketRoomArray = socket.rooms;
        const id = socket.id;
        for (let room of socketRoomArray) {
            if (room !== id)
                socket.leave(room);
        }
        const roomId = arg.roomId;
        socket.join(roomId);
        const joinedSockets = await io.in(arg.roomId).fetchSockets();
        arg.users = [];
        for (let socket of joinedSockets) {
            arg.users.push(socket.data);
        }
        io.emit("userJoined", arg.users);
        callback(`Joined room ${roomId}`, arg.users);
    })
    socket.on("message", async (message: string, {
        message_content,
        userSub, channelName,
        userPicture, userName,
        category, roomId, channelId
    }) => {
        socket.broadcast.to(roomId).emit("messages", message, {
            userSub, channelName,
            userPicture, userName,
            category, roomId, channelId,
        });
    })
    socket.on("disconnect_namespace", async (socket_id: string, users: string[]) => {
        const socketRooms = await io.of(namespace).fetchSockets();
        users = [];
        for (let socket of socketRooms) {
            if (socket.id === socket_id) {
                for (let room of socket.rooms) {
                    console.log(`Room socket ${socket.id} leaving`);
                    socket.leave(room);
                }
            }
            users.push(socket.data);
        }
        io.emit("userJoined", users);
        console.log(`${socket_id} got disconnected from the namespace`);
        socket.disconnect();
    })
    socket.on("sticker", (stickerUrl: string, { message_content,
        userSub, channelName,
        userPicture, userName,
        category, roomId, channelId }) => {
        socket.broadcast.to(roomId).emit("sticker", stickerUrl, {
            message_content,
            userSub, channelName,
            userPicture, userName,
            category, roomId, channelId
        });
    })
    socket.on("gif", (gifURL: string, { message_content,
        userSub, channelName,
        userPicture, userName,
        category, roomId, channelId }) => {
        socket.broadcast.to(roomId).emit("gif", gifURL, {
            message_content,
            userSub, channelName,
            userPicture, userName,
            category, roomId, channelId
        });
    })
    socket.on("leave-room", (room, id) => {
        console.log(`socket ${id} left ${room} room`);
    })
    socket.on("disconnecting", (resson) => {
        console.log(`Socket got disconnected due to ${resson}`);
    })
    socket.on("disconnect", (resson) => {
        console.log(`Socket got disconnected due to ${resson} in disconnect event`);
    })
})

httpServer.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
})
