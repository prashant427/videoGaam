import { Router } from "express";
import { register, login,logout } from "../controller/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { varifyToken } from "../middlewares/auth.middleware.js";
const router = Router()

router.route("/register").post( upload.fields([
    {
        name:"avatar",
        maxCount:1,
     },
    {
        name: "coverImage",
        maxCount:1,
    }]) ,register)

router.route("/login").post(login)

// secureRoutr
router.route("/logout").post(varifyToken , logout)



export default router;