import mongoose, { Types } from "mongoose";

interface messageBearer {
    username?: string,
    picture?: string,
    sub_id: String
}

interface messageUser {
    category: "video" | "audio" | "text",
    date?: Date,
    room: Types.ObjectId,
    channel: Types.ObjectId,
    message_content: string,
    message_bearer: messageBearer
}

const BearerSchema = new mongoose.Schema<messageBearer>({
    username: {
        type: String,
        default: "Unknown"
    },
    picture: {
        type: String,
        default: "No picture"
    },
    sub_id: {
        type: String,
        required: [true, "Please provide sub id for the user"]
    }
})

const messageSchema = new mongoose.Schema<messageUser>({
    category: {
        enum: ["video", "audio", "text"],
        type: String,
        required: [true, "Please specify the category of the message"]
    },
    date: {
        type: Date,
        default: Date.now()
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Please specify the room id"]
    },
    message_content: {
        type: String,
        required: [true, "Please specify the contents of the message"]
    },
    message_bearer: {
        type: BearerSchema,
        required: [true, "Please specify the bearer"]
    }
})

const Message = mongoose.model("Message", messageSchema);
export default Message;