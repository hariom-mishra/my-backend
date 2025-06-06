import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnClaudinary } from "../utils/claudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    //get user details from front end
    const { username, fullName, email, password } = req.body;
    //validation - not empty, proper data
    if ([fullName, username, email, password].some((field) => field === "")) {
        throw new ApiError(400, "all fields are required");
    }
    //check if user already exist - username and email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "username or email already exists");
    }
    //check for images and check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    //upload them to claudinary, avatar
    const avatar = await uploadOnClaudinary(avatarLocalPath)
    const coverImage = await uploadOnClaudinary(coverImageLocalPath);
    if (!avatar) {
        throw new ApiError(400, "avatar file is required");
    }

    // create object - create entry in db
    const user = await User.create({
        fullName: fullName,
        email: email,
        avatar: avatar.url,
        coverImage: coverImage.url,
        username: username,
        password: password,

    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    //check for user creation
    //remove password and refresh token field from response
    if (!createdUser) {
        throw new ApiError(500, "Someting went wrong our side while registering user")
    }
    //send response
    return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"))
})

export { registerUser };