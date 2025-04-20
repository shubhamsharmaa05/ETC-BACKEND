import {apiError} from "../utils/apiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken";
import { user } from "../models/user.model.js"

export const verifyJWT = asyncHandler(async (req, res, next)=>{
    try{
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "").trim();
        console.log(`token getting form frontend: ${token}`);
        if(!token){
            return res.status(401).json({
                success: false,
                message: "Unauthorized: No token",
                redirect: "register.html",
              });
        }

        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const User = await user.findById(decodedToken?._id).select("-password -refreshToken");
        // console.log(User);
        if(!User){
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid token",
                redirect: "register.html",
              });
        
        }

        req.User = User;
        next();
    }catch(error){
        console.log("JWT Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Token verification failed",
      redirect: "register.html",
    });
    }
})