import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import { Server } from "socket.io"
dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
app.get("/", (req, res) => {
    res.send("Hello World");
})

io.on("connection", (socket) => {
    console.log("Socket connected to main namespace");
})

httpServer.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
})