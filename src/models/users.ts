import mongoose, { Types } from "mongoose";

interface userInterface {
    username: string,
    user_id: string,
    picture: string,
    friends?: Types.ObjectId[],
    user_channels?: Types.ObjectId[],
    friendRequest?: Types.ObjectId[]
}

const userSchema = new mongoose.Schema<userInterface>({
    username: {
        type: String,
        required: [true, "Please enter username of the user"],
        minlength: 5
    },
    user_id: {
        type: String,
        required: [true, "Please enter user_id of the user"]
    },
    picture: {
        type: String,
        required: [true, "Please provide url for profile picture of the user"]
    },
    user_channels: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Channel"
    }],
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    friendRequest: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
})

const User = mongoose.model("User", userSchema);
export default User;