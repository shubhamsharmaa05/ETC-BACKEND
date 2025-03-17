import router, {Router} from "express"
import { userRegister } from "../controllers/user.controllers.js"

const Route = router();


Route.route("/signUp").post(userRegister);

export default Route;