import User from "../models/user.model.js";
import {getAuth} from 'firebase-admin/auth'
import {app} from '../config/firebase.js'
import redis from "../../../shared/redis/redis.js";
import { json } from "express";

export const login = async (req,res) => {
    try {

        const { token } = req.body;
        const decoded = await getAuth(app).verifyIdToken(token);
        let user = await User.findOne({firebaseUID: decoded.uid});

        if(!user){
            user = await User.create({
                firebaseUID: decoded.uid,
                name: decoded.name,
                email: decoded.email,
                avatar: decoded.picture
            });
        }

        const sessionId = crypto.randomUUID();

        const userData = {
            userId: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
        };

        await redis.set(`session-${sessionId}`, JSON.stringify(userData), "EX", 7 * 24 * 60 * 60);

        res.cookie("session", sessionId, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ success: true, user: userData });


    } catch (error) {

        console.log(`Error From Login Controller. \n Error: `, error);
        return res.status(500).json({success : false, message: "Error 500!"})
    }
}

export const logout = async(req,res)=>{
    try {
        const sessionId = req.cookies?.session;
        if (sessionId) {
            await redis.del(`session-${sessionId}`);
        }
        res.clearCookie("session", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/"
        });
        return res.status(200).json({success:true, message: 'Logout successfully'})
    } catch (error) {
        console.log(`Error from logout controller.`, error);
        return res.status(500).json({success:false, message: 'Error from logout controller'})
    }
}