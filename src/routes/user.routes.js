import router, {Router} from "express"
import { userRegister, OAuth2Client } from "../controllers/user.controllers.js"

const Route = router();


Route.route("/signUp").post(userRegister);
Route.route("/auth/signUp").post(OAuth2Client);


export default Route;