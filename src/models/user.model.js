import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { type } from "os"
import validator from "validator";
import dns from "dns";


const userSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    lastName:{
        type: String,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, "email is required"],
        lowercase: true,
        trim: true,
        unique: true,
        validate: {
            validator: async function (value) {
                // Basic email validation
                if (!validator.isEmail(value)) {
                    return false;
                }

                // Prevent multiple dots before '@'
                if (/\.\./.test(value.split("@")[0])) {
                    return false;
                }

                // Check if domain exists
                const domain = value.split("@")[1];
                try {
                    const records = await dns.promises.resolveMx(domain);
                    return records && records.length > 0;
                } catch (err) {
                    return false; // Invalid domain
                }
            },
            message: "Invalid or non-existent email domain.",
        },
    },
    password: {
        type: String,
        required: function () { return this.authType !== "google"; },
        trim: true,
        minlength: 8,
        validate: {
            validator: function (value) {
                return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]{8,}$/.test(value);
            },
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
        },
    },
    
    authType: {
        type: String,
        enum: ["local", "google"],
        default: "local"
    },
    googleId: {
        type: String, // Store Google ID for authentication
        unique: true,
        sparse: true // Allows multiple null values
    },
    address:[
        { 
            type: String,
            lowercase: true,
            trim: true
        }
    ],
    number: [
        {
          type: String,
          trim: true,
          validate: {
            validator: function (value) {
              return /^\d{10}$/.test(value); 
            },
            message: "Invalid phone number. Must be 10 digits.",
          },
        },
      ],
  refreshToken: {
        type: String
    },  
},{timestamps: true});

// hashing using bcrypt
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
  
    try {
      this.password = await bcrypt.hash(this.password, 10);
      next();
    } catch (error) {
      next(error);
    }
  });

// check the password to login,
userSchema.methods.isPasswordCorrect = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        },
    );
};

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
};

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userEmail: { type: String, required: true },
    items: [
      {
        name: String,
        price: Number,
        quantity: Number,
        size: String,
        image: String,
      },
    ],
    address: {
      name: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
    },
    totalAmount: Number,
    status: {
      type: String,
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });
  

export const Order = mongoose.model("Order", orderSchema);
export const user = mongoose.model("user",userSchema);