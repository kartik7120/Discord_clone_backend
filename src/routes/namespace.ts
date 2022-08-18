import express from "express";
import Channel from "../models/channels.js";
import User from "../models/users.js";
import { fetchUser } from "../middlewares/fetchUser.js";
import { createNamespace } from "../interfaces.js";
const router = express.Router();

router.post("/createNamespace/:namespace", async (req, res, next) => {
    const { namespace } = req.params;
    const userBody: createNamespace = req.body;
    console.log(`usersub = ${userBody.userSub}`);
    try {
        const newChannel = new Channel({ room: namespace });
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

export default router;