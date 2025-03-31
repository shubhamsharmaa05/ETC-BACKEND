import router, {Router} from "express"
import { userRegister, googleLogin } from "../controllers/user.controllers.js"

const Route = router();


Route.route("/signUp").post(userRegister);
Route.route("/auth/signUp").post(googleLogin);


export default Route;