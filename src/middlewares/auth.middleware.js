import {apiError} from "../utils/apiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken";
import { user } from "../models/user.model.js"

export const verifyJWT = asyncHandler(async (req, res, next)=>{
    try{
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","");
        console.log(`token getting form frontend: ${token}`);
        if(!token){
            throw new apiError(401,"unauthorized required");
        }

        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const User = await user.findById(decodedToken?._id).select("-password -refreshToken");
        // console.log(User);
        if(!User){
            throw new apiError(401,"invalid accessToken");
        }

        req.User = User;
        next();
    }catch(error){
        throw new apiError(401,"invalid accessToken");
    }
})