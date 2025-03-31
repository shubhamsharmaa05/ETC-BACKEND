import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiRespones.js";
import { user} from "../models/user.model.js";
import {OAuth2Client} from "google-auth-library";

const  userRegister = asyncHandler(async (req, res)=>{
    // get user details
    const {firstName, lastName, password, Email, confirm_password} = req.body;
    // check if empty or not
    if([firstName, lastName, password, Email, confirm_password].some(
        (field)=> field?.trim() === "",
    )){
        throw new apiError(400, "all fields are required");
    }
    // check the confirm password and password
    if(password != confirm_password){
        throw new apiError(400, "password are not same");
    }

    // check user exits  or not
    const existedUser = await user.findOne({Email});
    if (existedUser){
        throw new apiError(409,"already exits email");
    }

    const User = await user.create({
        firstName,
        lastName,
        Email,
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

        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: "921058034806-5e0mktavr81tadlmiidtcpgeifkd05fo.apps.googleusercontent.com",
        });

        const payload = ticket.getPayload();
        const { name: firstName, email, sub: googleId } = payload;
        console.log(email);

        let User = await user.findOne({ email });

        if (!User) {
            User = new user({
                firstName: email,
                Email: email,
                googleId: googleId, // Use unique Google ID instead of token
                authType: "google",
            });
            await User.save();
        } else {
            User.googleToken = token; // Not recommended, but kept if needed
            await User.save();
        }

        return res.status(201).json(new apiResponse(200, User, "User registered successfully"));
    } catch (error) {
        console.error("Google login error:", error);
        return res.status(500).json(new apiResponse(500, {}, "Internal Server Error"));
    }
});

export {
    userRegister,
    googleLogin,
}