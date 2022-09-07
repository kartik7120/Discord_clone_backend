import express from "express";
import Channel from "../models/channels.js";
import User from "../models/users.js";
import { fetchUser } from "../middlewares/fetchUser.js";
import { createNamespace } from "../interfaces.js";
import Room from "../models/rooms.js";
import Message from "../models/messages.js";
import cloudinary from "../cloudinary/index.js";
import mongoose from "mongoose";
const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        const channels = await Channel.find({});
        res.json(channels);
    } catch (error) {
        res.status(500).json("Error occured while fetching channels , please try again")
    }
})

router.post("/userData", async (req, res, next) => {
    const { userSub, userPicture, userName } = req.body;
    try {
        const user = await User.findOne({ user_id: userSub });
        if (user) {
            return res.json("User already present");
        }
        else {
            const newUser = new User({
                picture: userPicture,
                username: userName,
                user_id: userSub
            })
            await newUser.save();
            return res.json("New user saved in the database");
        }
    } catch (error) {
        res.status(500).json("Error occured while saving userData")
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

router.post("/leaveNamespace/:id", async (req, res, next) => {
    const { id } = req.params;
    try {
        const { userSub } = req.body;
        const user = await User.findOneAndUpdate({ user_id: userSub }, { $pull: { user_channels: id } }, { new: true });
        res.json(user?.user_channels);
    } catch (error) {
        res.status(500).json("Error occured while leaving channel")
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

router.get("/messages/:roomId", async (req, res, next) => {
    const { roomId } = req.params;
    try {
        const room = await Room.findOne({ _id: roomId }).populate("message");
        res.json(room?.message);
    } catch (error) {
        res.status(500).json("Error occured while fetching messages");
    }
})

router.post("/messages/:roomId", async (req, res, next) => {
    const { roomId } = req.params;
    try {
        let { userSub, category, message_content, userPicture, userName } = req.body;
        const newMessage = new Message({
            category,
            room: roomId,
            message_content,
            message_bearer: {
                sub_id: userSub,
                picture: userPicture,
                username: userName
            }
        })
        await newMessage.save();
        const room = await Room.findOneAndUpdate({ _id: roomId }, { $push: { message: newMessage._id } },
            { new: true }).populate("message");
        res.json(room?.message);
    } catch (error) {
        console.log(`Error while saving messages = ${JSON.stringify(error)}`);
        res.status(500).json("Error occured while saving message");
    }
})

router.get("/friends/:userSub", async (req, res, next) => {
    const { userSub } = req.params;
    try {
        const user = await User.findOne({ user_id: userSub }).populate("friends");
        if (!user) {
            return res.json("User does not exists");
        }
        res.json(user?.friends);
    } catch (error) {
        res.status(500).json("Error occured while fetching friends")
    }
})

router.post("/friends", async (req, res, next) => {
    const { userSub, _id } = req.body;
    try {
        const user = await User.findOneAndUpdate({ user_id: userSub }, { $pull: { friendRequest: _id } });
        const user2 = await User.findOneAndUpdate({ user_id: userSub }, { $push: { friends: _id } }).populate("friends");
        res.json(user2?.friends);
    } catch (error) {
        res.status(500).json("Error occured while adding friends");
    }
})

router.delete("/friends/deleteFriend", async (req, res, next) => {
    const { userSub, _id } = req.body;
    try {
        const user = await User.findOneAndUpdate({ user_id: userSub },
            { $pull: { friends: _id } }, { new: true }).populate("friends");
        res.json(user?.friends);
    } catch (error) {
        console.log(`Error occured while deleting a friend = ${JSON.stringify(error)}`);
        res.status(500).json("Error occured while removing friends");
    }
})

router.get("/friends/friendRequest/:userSub", async (req, res, next) => {
    const { userSub } = req.params;
    try {
        const user = await User.findOne({ user_id: userSub }).populate("friendRequest");
        console.log(`user in get request for friend request = ${user}`);
        if (!user) {
            res.json("No user exists")
        }
        else
            if (!user.friendRequest) {
                res.json("No friend requests present")
            }
            else {
                console.log(`user request = ${user.friendRequest}`);
                res.json(user?.friendRequest);
            }
    } catch (error) {
        res.status(500).json("Error occured while fetching friend request")
    }
})

router.post("/friends/friendRequest", async (req, res, next) => {
    const { userSub, friendSub, friendName, friendPicture } = req.body;
    try {
        console.log(`userSub = ${userSub} , friendSub = ${friendSub}`);
        const friend = await User.findOneAndUpdate({ user_id: userSub },
            { $set: { picture: friendPicture, username: friendName } }, { new: true });
        const user = await User.findOneAndUpdate({ user_id: friendSub },
            { $push: { friendRequest: friend?._id } },
            { new: true, upsert: true }).populate("friendRequest");
        res.json(user?.friendRequest);
    } catch (error) {
        console.log(JSON.stringify(`Error while making friend request ${error}`));
        res.status(500).json("Error occured while sending friend request");
    }
})

router.delete("/friends/friendRequest", async (req, res, next) => {
    const { userSub, _id } = req.body;
    try {
        console.log(`userSub = ${userSub} and _id = ${_id} in delete request`);
        const user = await User.findOneAndUpdate({ user_id: userSub }, { $pull: { friendRequest: _id } }, { new: true })
            .populate("friendRequest");

        res.json(user?.friendRequest);
    } catch (error) {
        res.status(500).json("Error occured while deleting friend request");
    }
})

export default router;