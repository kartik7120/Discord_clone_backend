import mongoose from "mongoose";
import { messageBearer, messageUser } from "./messages";
import Message from "./messages";
interface roomInterface {
    roomName: string,
    message?: messageUser[]
}

const roomSchema = new mongoose.Schema<roomInterface>({
    roomName: {
        type: String,
        required: [true, "Please provide the name for room"],
    },
    message: {
        type: [Message]
    }
})

const Room = mongoose.model("Room", roomSchema);
export default Room;