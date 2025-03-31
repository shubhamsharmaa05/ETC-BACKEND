import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiRespones.js";
import { user} from "../models/user.model.js";
import {OAuth2Client} from "google-auth-library";
import Joi from "joi";


const  userRegister = asyncHandler(async (req, res)=>{
    // get user details
    const {firstName, lastName, password, email, confirmPassword} = req.body;
    // check if empty or not
    if([firstName, lastName, password, email, confirmPassword].some(
        (field)=> field?.trim() === "",
    )){
        throw new apiError(400, "all fields are required");
    }
    // check the confirm password and password
    if(password != confirmPassword){
        throw new apiError(400, "password are not same");
    }

    // check user exits  or not
    const existedUser = await user.findOne({email});
    if (existedUser){
        throw new apiError(409,"already exits email");
    }

    const User = await user.create({
        firstName,
        lastName,
        email,
        password
    });

    const createdUser = await user
        .findById(User._id)
        .select("firstName")

    if(!createdUser){
        throw new apiError(500, "something went wrong while registring user!");
    }

    return res
        .status(201)
        .json(
            new apiResponse(200,createdUser,"user registered Successfully")
        );
})


const client = new OAuth2Client("921058034806-5e0mktavr81tadlmiidtcpgeifkd05fo.apps.googleusercontent.com");

const googleLogin = asyncHandler(async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json(new apiResponse(400, {}, "Token is required"));
        }

        // Validate token format
        const schema = Joi.object({ token: Joi.string().required() });
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json(new apiResponse(400, {}, "Invalid token format"));
        }

        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: "921058034806-5e0mktavr81tadlmiidtcpgeifkd05fo.apps.googleusercontent.com",
        });

        const payload = ticket.getPayload();
        if (!payload || payload.exp * 1000 < Date.now()) {
            return res.status(401).json(new apiResponse(401, {}, "Token has expired"));
        }

        const { email, sub: googleId } = payload;

        // Check if user exists
        let User = await user.findOne({ $or: [{ email }, { googleId }] });

        if (!User) {
            User = new user({
                firstName: email,
                email: email,
                googleId: googleId,
                authType: "google",
            });
            await User.save();
            return res.status(201).json(new apiResponse(200, User, "User registered successfully"));
        } else {
            return res.status(200).json(new apiResponse(200, User, "User logged in successfully"));
        }
    } catch (error) {
        console.error("Google login error:", error);
        logger.error(`Google login failed for token: ${req.body.token}`);
        return res.status(500).json(new apiResponse(500, {}, "Internal Server Error"));
    }
});





export {
    userRegister,
    googleLogin,
}