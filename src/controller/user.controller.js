import {asyncHandler} from '../utils/asyncHandeler.js';
import { apiError } from "../utils/apiError.js";
import {User} from '../models/user.js'
import { uplodadCloud } from "../utils/fileUplod.js";
import { apiResponce } from "../utils/apiResponce.js";

 const generateAccessReferesToken = async (user_id) => {
    try {
        
        const user = await User.findById(user_id);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new apiError(500, "Token generation failed");
    }
 }

const register = asyncHandler(async (req, res, next) => {
    const { fullName,username,email,password, } = req.body
    

    if (
        [fullName, username, email, password].some((field) => field?.trim() === "")
    ) {
        throw new apiError(400, "fill required fields properly");
    }
    

    const exsistedUser = await User.findOne({
        $or: [{ email }, { username }],
    })
    if (exsistedUser) {
        throw new apiError(409, "User already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0].path;
    const coverImageLocalPath = req.files?.coverImage?.[0].path;

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar is required");
    }

    const avatar = await uplodadCloud(avatarLocalPath)
    const coverImage = await uplodadCloud(coverImageLocalPath)

    if(!avatar) throw new apiError(500, "Avatar upload failed");

    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url ||  "" ,
    });
    console.log(user);
    

    const createdUser = await User.findById(user.id).select("-password -refreshToken" );
    console.log(createdUser);
    
    if(!createdUser) throw new apiError(500, "User registration failed by server");

    return res.status(201).json(new apiResponce(201, createdUser, "User created successfully"));
})


const login = asyncHandler(async (req, res, next) => {

    const { username, email, password } = req.body;

    if(!username || !email){
        throw new apiError(400, "username or email is required");
    }
    
    const user = await User.findOne({ $or: [{ email }, { username }] });

    throw new apiError(404, "User not found");

    const isMatch = await user.passwordMatch(password);
    
    if (!isMatch) {
        throw new apiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessReferesToken(user._id)

    const loginUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(new apiResponce(200, {loginUser,accessToken,refreshToken}, "User logged in successfully"));

});

const logout = asyncHandler(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, { $set:{ refreshToken: undefined } },{new:true} );

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponce(200, null, "User logged out successfully"));
})

export { register , login, logout } ;