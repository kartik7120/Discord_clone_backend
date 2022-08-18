import express from "express";
import Channel from "../models/channels.js";
import User from "../models/users.js";
import { fetchUser } from "../middlewares/fetchUser.js";
import { createNamespace } from "../interfaces.js";
const router = express.Router();

// router.get("/", async (req, res, next) => {
//     const namespaces = await User.find().populate("user_channels");
//     res.json(namespaces.user_channels);
// })

router.get("/:id", async (req, res, next) => {
    const { id } = req.params;
    try {
        const namespace = await Channel.findById(id).populate("room");
        res.json(namespace);
    } catch (error) {
        res.status(500).json("Error occured while fetching the namespace");
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
        // console.log(currUser);
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

export default router;