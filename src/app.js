import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"
import { apiError } from "./utils/apiError.js";

const app = express();

app.use(
    cors({
        origin:process.env.CORS_ORIGIN, 
        credentials: true, 
    })
);

app.use(express.json({ limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

// import router to handle routes 
import userRouter from "../src/routes/user.routes.js";
// import { apiError } from "./utils/apiError.js";

app.use("/api/v1/users", userRouter);


app.use((err, req, res, next) => {
    if (err instanceof apiError) {
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            errors: err.errors,
        });
    }

    // Default Error Handler
    res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
});

export {app};