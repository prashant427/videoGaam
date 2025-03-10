import {asyncHandler} from '../utils/asyncHandeler.js';
import { apiError } from "../utils/apiError.js";
import {User} from '../models/user.js'
import { uplodadCloud } from "../utils/fileUplod.js";
import { apiResponce } from "../utils/apiResponce.js";
import jwt from "jsonwebtoken";
import { json } from 'express';

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

    
    const { username,email,password, } = req.body
    
    
    if(!(username || email)){
        throw new apiError(400, "username or email is required");
    }
    
    const user = await User.findOne({ $or: [{ email }, { username }] });

    if(!user) throw new apiError(404, "User not found");

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
    console.log(req.user);
    
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

const refreshAccessToken = asyncHandler(async (req, res, next) => {
    const { Token } = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!Token) {
        throw new apiError(401, "Unauthorized request");
    }

    try {
        const decoded = jwt.verify(Token, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded?._id);
    if(!user) throw new apiError(401, "Invalid token");

    if(Token !== user?.refreshToken) throw new apiError(401, "refresh token is invalid or expierd");

    const options = {
        httpOnly: true,
        secure: true,
    }

    const { gen_accessToken, gen_refreshToken }= await generateAccessReferesToken(user._id)

    return res
    .status(200)
    .cookie("accessToken", gen_accessTokenaccessToken, options)
    .cookie("refreshToken", gen_refreshToken, options)
    json(new apiResponce(200, {accessToken: gen_accessToken , refreshToken: gen_refreshToken },
        "Token generation successfully"
    ))

    } catch (error) {
        throw new apiError(401, error.message || "Invalid token");     
    }

})

const changeCurrentPassword = asyncHandler(async (req, res, next) => {
    const {oldPassword, newPassword}  = req.body 

   const user = await User.findById(req.user._id)
   const isMatch = await user.passwordMatch(oldPassword)
    if(!isMatch) throw new apiError(400, "Invalid password")

    user.password = newPassword;
    await user.save({validateBeforeSave: false})

    return res.status(200).json(new apiResponce(200, null, "Password changed successfully"))
});

const getProfile = asyncHandler(async (req, res, next) => {
    return res.status(200)
    .json(new apiResponce(200, req.user, "User profile fetched successfully"))
    

});

const updateProfile = asyncHandler(async (req, res, next) => {
    const { fullName, email } = req.body;

    if ( !(fullName|| email ) )  {
        throw new apiError(400, "fill required fields properly");
    }

    const updatedUser = await  User.findByIdAndUpdate(user._id, { 
        $set: {
            fullName: fullName || user.fullName,
            email: email || user.email,
        }
     }, { new: true }).select("-password -refreshToken");


    return res.status(200).json(new apiResponce(200, updatedUser, "User updated successfully"));
});

const updateAvatar = asyncHandler(async (req, res, next) => {
    const avatarLocalPath = req.file?.avatar?.[0].path;
    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar is required");
    }

    const avatar = await uplodadCloud(avatarLocalPath)
    if(!avatar) throw new apiError(500, "Avatar upload failed");

    const updatedUser = await User.findByIdAndUpdate(user._id, { $set: { avatar: avatar.url } }, { new: true }).select("-password -refreshToken");


    return res.status(200).json(new apiResponce(200, updatedUser, "Avatar updated successfully"));
});

const updateCoverImage = asyncHandler(async (req, res, next) => {
    const coverImageLocalPath = req.file?.coverImage?.[0].path;
    if (!coverImageLocalPath) {
        throw new apiError(400, "Cover image is required");
    }

    const coverImage = await uplodadCloud(coverImageLocalPath)
    if(!coverImage) throw new apiError(500, "Cover image upload failed");

    const updatedUser = await User.findByIdAndUpdate(user._id, { $set: { coverImage: coverImage.url } }, { new: true }).select("-password -refreshToken");

    return res.status(200).json(new apiResponce(200, updatedUser, "Cover image updated successfully"));
});


const getChannelProfile = asyncHandler(async (req, res, next) => {
    const { username } = req.params;
    if (!username?.trim()) {
        throw new apiError(400, "channel is not found ");
        
    }
    
    const channel =  User.aggregate([
        {
            $match: { username: username?.toLowerCase() }
        },
        {
            $lookup: {
                from: "Subscription",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "Subscription",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        }, 
        {
            $addFields:{
                subscriberCount: { $size: "$subscribers" },
                channelSubscribedCount: { $size: "$subscribedTo" },
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$subscribers.subscriber"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                subscriberCount: 1,
                channelSubscribedCount: 1,
                isSubscribed: 1,
                username:1,
                fullName: 1,
                avatar: 1,
                coverImage: 1,


            }
        }
    ])

    if(!channel?.length) throw new apiError(404, "Channel not found");
    return res.status(200).json(new apiResponce(200, channel[0], "Channel found successfully"));
})

const getHistory = asyncHandler(async (req, res, next) => {
    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "Video",
                localField: "watchHistory.video",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "User",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1,

                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: { $first: "$owner" }
                        }
                    }
                    
                ]
            }
        }
    ])

    res.status(200).json(new apiResponce(200, user[0].watchHistory, "Watch history fetched successfully"));


})

export { register , login, logout,generateAccessReferesToken ,refreshAccessToken,changeCurrentPassword, getProfile, updateProfile, updateAvatar, updateCoverImage, getChannelProfile,getHistory } ;