import { Router } from "express";
import { register } from "../controller/user.controller.js";

const router = Router()

router.route("/api/v1/register").post(register)


export default router;