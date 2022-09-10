import mongoose, { Types } from "mongoose";

interface friendRoom {
    user_id: Types.ObjectId,
    user_sub:string,
    messages: Types.ObjectId[]
}

const friendMessageSchema = new mongoose.Schema<friendRoom>({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    user_sub: {
        type: String,
        required: [true, "Plesae enter user sub"]
    },
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        default:[]
    }]
})

const FriendRoom = mongoose.model("FriendRoom", friendMessageSchema);
export default FriendRoom;