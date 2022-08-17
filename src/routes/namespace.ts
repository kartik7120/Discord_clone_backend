import express from "express";
import Channel from "../models/channels.js";
import User from "../models/users.js";
import { fetchUser } from "../middlewares/fetchUser.js";
const router = express.Router();

router.post("/createNamespace/:namespace", async (req, res, next) => {
    const { namespace } = req.params;
    const { userSub } = req.body;
    console.log(`usersub = ${userSub}`);
    const newChannel = new Channel({ room: namespace });
    const currUser = await fetchUser(userSub);
    console.log(currUser);
    res.json(namespace);
})

export default router;