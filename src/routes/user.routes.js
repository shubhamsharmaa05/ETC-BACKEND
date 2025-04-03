import router, {Router} from "express"
import { userRegister, googleLogin, loginUser } from "../controllers/user.controllers.js"

const Route = router();


Route.route("/signUp").post(userRegister);
Route.route("/auth/signUp").post(googleLogin);
Route.route("/login").post(loginUser);


export default Route;