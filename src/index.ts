import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io"
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

io.on("connection", (socket) => {
    console.log("Socket connected to main namespace");
    console.log(socket.id);
})

httpServer.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
})