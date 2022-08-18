import mongoose, { Types } from "mongoose";

interface channelSchema {
    channelName: string
    room?: Types.ObjectId[],
    description?: string,
    picture?: string
}

const channelSchema = new mongoose.Schema<channelSchema>({
    channelName: {
        type: String,
        lowercase: true,
        required: [true, "Please provide name of the channel"]
    },
    room: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room"
    }],
    description: {
        type: String,
        minlength: 10
    },
    picture: {
        type: String
    }
})

const Channel = mongoose.model("Channel", channelSchema);
export default Channel;