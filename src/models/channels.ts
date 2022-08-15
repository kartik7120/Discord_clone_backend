import mongoose from "mongoose";

interface channelSchema {
    room: string[],
    description?: string,
    picture?: string
}

const channelSchema = new mongoose.Schema<channelSchema>({
    room: {
        type: [String],
        required: [true, "Please provide rooms array"]
    },
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