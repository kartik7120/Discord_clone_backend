import mongoose, { Types } from "mongoose";
import { messageBearer, messageUser } from "../models/messages.js";
import Message from "../models/messages.js";
interface roomInterface {
    roomName: string,
    message?: Types.ObjectId[],
    channel?: Types.ObjectId
}

const roomSchema = new mongoose.Schema<roomInterface>({
    roomName: {
        type: String,
        required: [true, "Please provide the name for room"],
    },
    message: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Message"
    }],
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Channel"
    }
})

const Room = mongoose.model("Room", roomSchema);
export default Room;