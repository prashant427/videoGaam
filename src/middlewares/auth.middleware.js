import { asyncHandler } from "../utils/asyncHandeler.js";
import { apiError } from '../utils/apiError.js';
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { login } from "../controller/user.controller.js";

export const varifyToken = asyncHandler(async (req, res, next) => {
try {   
        const token =  req.cookies?.accessToken  || req.headers("authorization")?.replace("Bearer ", "");   
         
        
        if (!token) {
            throw new apiError(401, "Unauthorized request"); 
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        console.log(decoded?._id);  
        
        const user = await User.findById(decoded?._id)
        
        
        

        if (!user) {
            throw new apiError(401, "invalid token");
        }
    
        req.user = user;
    
        next(); 
} catch (error) {
    throw new apiError(401, error?.message);
    
}
});
