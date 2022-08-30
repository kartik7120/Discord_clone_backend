import express from "express";
import Channel from "../models/channels.js";
import User from "../models/users.js";
import { fetchUser } from "../middlewares/fetchUser.js";
import { createNamespace } from "../interfaces.js";
import Room from "../models/rooms.js";
const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        const channels = await Channel.find({});
        res.json(channels);
    } catch (error) {
        res.status(500).json("Error occured while fetching channels , please try again")
    }
})

router.get("/userNamespaces/:id", async (req, res, next) => {
    const { id } = req.params;
    try {
        const currUser = await fetchUser(`${id}`);
        const userChannels = await User.findOne({ user_id: id }).populate("user_channels").select("_id channelName room");
        res.json(userChannels?.user_channels);
    } catch (error) {
        res.status(500).json("Error occured while fetching user channels");
    }
})

router.get("/:id", async (req, res, next) => {
    const { id } = req.params;
    try {
        const namespace = await Channel.findById(id).populate("room");
        res.json(namespace?.room);
    } catch (error) {
        res.status(500).json("Error occured while fetching the namespace");
    }
})

router.post("/joinChannel/:id", async (req, res, next) => {
    const { id } = req.params;
    const { userSub } = req.body;
    try {
        const user = await User.findOneAndUpdate({ user_id: userSub }, { $push: { user_channels: id } }, { new: true });
        res.json(user?.user_channels);
    } catch (error) {
        res.status(500).json("Error occured while joining the room");
    }
})

router.get("/fetchChannel/:id", async (req, res, next) => {
    const { id } = req.params;
    try {
        const channel = await Channel.findById(id).populate("room");
        res.json(channel);
    } catch (error) {
        res.status(500).json("Error occured while fetching channel");
    }
})

router.post("/createNamespace/:namespace", async (req, res, next) => {
    const { namespace } = req.params;
    const userBody: createNamespace = req.body;
    console.log(`usersub = ${userBody.userSub}`);
    try {
        const newChannel = new Channel({ channelName: namespace });
        await newChannel.save();
        const currUser = await fetchUser(`${userBody.userSub}`);
        const user = await User.findOneAndUpdate({ user_id: userBody.userSub },
            { $push: { user_channels: newChannel._id } }, { new: true, upsert: true });
        res.json(namespace);
    } catch (error) {
        res.status(500).json("Error occured while creating a namespace, Please try again");
    }
})

router.delete("/:id", async (req, res, next) => {
    const { id } = req.params;
    const userBody: createNamespace = req.body;
    try {
        const deletedDocuemnt = await Channel.findByIdAndRemove(id);
        const currUser = await fetchUser(`${userBody.userSub}`);
        const user = await User.findOneAndUpdate({ user_id: userBody.userSub }, { $pull: { user_channels: id } }, { new: true }).populate("user_channels")
        res.json(user);
    } catch (error) {
        res.status(500).json("Error occured while deleting a namespace");
    }

})

router.post("/createRooms", async (req, res, next) => {
    const { roomName, userSub, channelId } = req.body;
    try {
        const newRoom = new Room({ roomName, channel: channelId });
        await newRoom.save();
        const channel = await Channel.findOneAndUpdate({ _id: channelId }, { $push: { room: newRoom._id } }, { new: true }).populate("room");
        res.json(channel?.room);
    } catch (error) {
        res.status(500).json("Error occured while creating new room");
    }
})

router.delete("/deleteRooms/:namespaceId/rooms/:roomId", async (req, res, next) => {
    const { namespaceId, roomId } = req.params;
    try {
        const deleteRoom = await Room.findByIdAndDelete({ _id: roomId });
        const channels = await Channel.findOneAndUpdate({ _id: namespaceId }, { $pull: { room: roomId } }, { new: true })
            .populate("room");
        res.json(channels?.room);
    } catch (error) {
        res.status(500).json("Error occured while deleting room in a channel");
    }
})

router.delete("/deleteNamespace/:id", async (req, res, next) => {
    const { userSub } = req.body;
    const { id } = req.params;
    try {
        const deletedRooms = await Room.deleteMany({ channel: id });
        const deletedChannel = await Channel.findByIdAndDelete(id);
        const user = await User.findOneAndUpdate({ user_id: userSub }, { $pull: { user_channels: id } }, { new: true })
            .populate("user_channels");
        res.json(user?.user_channels);
    } catch (error) {
        console.log(`Error while deleting namespace = ${error}`);
        res.status(500).json("Error occured while deleting channel");
    }
})

export default router;