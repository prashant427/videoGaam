import { Router } from "express";
import { register } from "../controller/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router()

router.route("/api/v1/register").post( upload.fields([
    {
        name:"avatar",
        maxCount:1,
     },
    {
        name: "coverImage",
        maxCount:1,
    }]) ,register)


export default router;