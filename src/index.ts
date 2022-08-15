import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";
import joinRoom from "./interfaces";
import axios from "axios";
import mongoose from "mongoose";
mongoose.connect('mongodb://localhost:27017/Discord')
    .then(() => {
        console.log("Connected to MongoDB database");
    }).catch((err) => {
        console.log(`Error occured while connecting to the Mongo DB database = ${err}`)
    })
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

io.of((name, auth, next) => {
    console.log("name = ", name);
    console.log("auth = ", auth);
    next(null, true);
}).on("connection", async (socket) => {
    const namespace = socket.nsp.name;
    const sockets = await io.of(namespace).fetchSockets();
    // sockets.forEach(socket => {
    //     console.log(`socket id = ${socket.id} and rooms = ${socket.rooms}`);
    // });
    // console.log(`Connected to ${namespace} namespace`);
    console.log(`socket id = ${socket.id} in ${namespace} namespace`);
    const numeberOfClients = io.of(namespace).sockets.size;
    const ioNumberOfClients = io.engine.clientsCount;
    console.log(`Number of sockets connecteed in ${namespace} namespace = ${ioNumberOfClients}`);
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
    socket.on("message", async (message: string, channelName: string, userSub: string) => {
        // console.log("Recieved message from the frontend = ", message);
        // console.log(`User sub = ${userSub}`);
        const URL = `${process.env.AUTH_MANAGEMENT_API_AUDIENCE}users/${userSub}?include_fields=true`;
        const config = {
            headers: {
                'Authorization': process.env.AUTH_MANAGEMENT_API_TOKEN!
            },
            "content-type": "application/json; charset=utf-8"
        }
        const response = await axios.get(URL, config);
        // console.log(response);
        socket.to(channelName).emit("messages", message, {
            name: response.data.name,
            picture: response.data.picture
        });
    })
    socket.on("disconnect_namespace", async (socket_id: string) => {
        const socketRooms = await io.of(namespace).fetchSockets();
        for (let socket of socketRooms) {
            if (socket.id === socket_id) {
                for (let room of socket.rooms) {
                    console.log(`Room socket ${socket.id} leaving`);
                    socket.leave(room);
                }
            }
        }
        console.log(`${socket_id} got disconnected from the namespace`);
        socket.disconnect();
    })
    socket.on("sticker", (stickerUrl: string) => {
        socket.broadcast.emit("sticker", stickerUrl);
    })
    socket.on("gif", (gifURL: string) => {
        socket.broadcast.emit("gif", gifURL);
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