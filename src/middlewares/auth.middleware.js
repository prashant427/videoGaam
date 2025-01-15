import { asyncHandler } from "../utils/asyncHandeler";
import { apiError } from '../utils/apiError';
import { jwt } from "jsonwebtoken";
import { User } from "../models/user.model";

export const varifyToken = asyncHandler(async (req, res, next) => {
try {
        const token =  req.cookies?.accessToken  || req.headers("authorization")?.replace("Bearer ", "");   
    
        if (!token) {
            throw new apiError(401, "Unauthorized request"); 
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        const user = await User.findById(decoded?._id.select(-password -refreshToken), (err, user) => {})
    
        if (!user) {
            throw new apiError(401, "invalid token");
        }
    
        req.user = user;
    
        next(); 
} catch (error) {
    throw new apiError(401, error?.message);
    
}
});
