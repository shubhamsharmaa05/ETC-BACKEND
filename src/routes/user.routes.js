import router, {Router} from "express"
import { userRegister, googleLogin, loginUser, me } from "../controllers/user.controllers.js"
import { verify } from "crypto";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const Route = router();


Route.route("/signUp").post(userRegister);
Route.route("/auth/signUp").post(googleLogin);
Route.route("/login").post(loginUser);
Route.route("/me").get(verifyJWT,me);


export default Route;