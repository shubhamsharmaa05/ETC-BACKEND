import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiRespones.js";
import { user} from "../models/user.model.js";


const  userRegister = asyncHandler(async (req, res)=>{
    // get user details
    const {firstName, lastName, password, email, confirm_password} = req.body;
    // check if empty or not
    if([firstName, lastName, password, email, confirm_password].some(
        (field)=> field?.trim() === "",
    )){
        throw new apiError(400, "all fields are required");
    }
    // check the confirm password and password
    if(password != confirm_password){
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

const OAuth2Client = asyncHandler(async (req,res)=>{
    const {token} = req.body;

    const payload = ticket.getPayload();
    const {firstName ,email} = payload;

    let user = await user.findOne({email});
    if(!user){
        user = new user({
            fullName: firstName,
            email: email,
            googleId: token,
        });
        await user.save();
    } else {
        user.googleToken = token;
        await user.save();
    }
    return res
        .status(201)
        .json(
            new apiResponse(200,createdUser,"user registered Successfully")
        );

})

export {
    userRegister,
    OAuth2Client
}