import {asyncHandler} from '../utils/asyncHandeler.js';
import { apiError } from "../utils/apiError.js";
import {User} from '../models/user.js'
import { uplodadCloud } from "../utils/fileUplod.js";
import { apiResponce } from "../utils/apiResponce.js";

const register = asyncHandler(async (req, res, next) => {
    const {fullName,username,email,password,} =req.body
    console.log( email);

    if (
        [fullName, username, email, password].some((field) => field?.trim() === "")
    ) throw new apiError(400, "fill required fields properly");
    
    // check this function find something
    User.findOne({
        $or: [{ email }, { username }],
    }).then((user) => {
        if (user) {
            throw new apiError(401, "User already exists");
        }
    })

    const avatarLocalPath = req.files?.avatar?[0].path;
    const coverImageLocalPath = req.files?.coverImage?[0].path;

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar is required");
    }

    const avatar = await uplodadCloud(avatarLocalPath)
    const coverImage = await uplodadCloud(coverImageLocalPath)

    if(!avatar) throw new apiError(500, "Avatar upload failed");

    const user = await User.create({
        fullName,
        username = username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url ||  "" ,
    }).then((user) => {
        res.status(201).json({
            success: true,
            data: user,
        });
    }).catch((error) => {
        throw new apiError(500, "User registration failed", error);
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken" );

    if(!createdUser) throw new apiError(500, "User registration failed by server");

    return res.status(201).json(new apiResponce(201, createdUser, "User created successfully"));
})

export { register } ;