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
        required: true,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
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
        required: true,
        trim: true,
        minlength: 8, // Ensures password is at least 8 characters
        validate: {
            validator: function (value) {
                return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
            },
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
        }
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
    
    refreshToken:{
        type: String
    }
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


export const user = mongoose.model("user",userSchema);