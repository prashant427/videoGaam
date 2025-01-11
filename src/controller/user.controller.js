import {asyncHandler} from '../utils/asyncHandeler.js';

const register = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: 'Register route'
    })
})

export { register } ;