import express, { urlencoded } from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";
import joinRoom from "./interfaces";
import axios from "axios";
import mongoose from "mongoose";
import router from "./routes/namespace.js";
dotenv.config();
const URL = process.env.MONGO_DB_URL || "mongodb://localhost:27017/Discord"
mongoose.connect(URL)
    .then(() => {
        console.log("Connected to MongoDB database");
    }).catch((err) => {
        console.log(`Error occured while connecting to the Mongo DB database = ${err}`)
    })
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
    const numeberOfClients = io.of(namespace).sockets.size;
    const ioNumberOfClients = io.engine.clientsCount;
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
                    socket.leave(room);
                }
            }
            users.push(socket.data);
        }
        io.emit("userJoined", users);
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
    })
    socket.on("disconnecting", (resson) => {
    })
    socket.on("disconnect", (resson) => {
    })
})

httpServer.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
})
