import { Router } from "express";
import { 
    register , 
    login, 
    logout,
    refreshAccessToken,
    changeCurrentPassword, 
    getProfile, 
    updateProfile, 
    updateAvatar, 
    updateCoverImage, 
    getChannelProfile,
    getHistory
} from "../controller/user.controller.js";
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
router.route(("/generateToken")).post(refreshAccessToken)
router.route("/change-password").post(varifyToken,changeCurrentPassword)
router.route("/get-profil").get(varifyToken,getProfile)
router.route("/update-profil").patch(varifyToken,updateProfile)
router.route("/update-avatar").patch(varifyToken,upload.single("avatar"),updateAvatar)
router.route("/update-cover-image").patch(varifyToken,upload.single("coverImage"),updateCoverImage)
router.route("/channel/:id").get(varifyToken,getChannelProfile)
router.route("history").get(varifyToken,getHistory)



export default router;