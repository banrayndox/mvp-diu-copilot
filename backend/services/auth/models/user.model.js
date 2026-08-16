import mongoose from "mongoose";
const { Schema, model } = mongoose;

const UserSchema = new Schema(
    {
        firebaseUID : {
            type: String,
            unique: true
        },
        name: {
            type: String,
        },
        email : {
            type: String
        },
        avatar: {
            type: String
        },
        skills: [{
            type: String
        }],
        department: {
            type: String
        },
        batch: {
            type: String
        },
        semester: {
            type: String
        },
        bio: {
            type: String
        }
    },
    {
        timestamps: true
    }
);


const User = model("User", UserSchema);

export default User;