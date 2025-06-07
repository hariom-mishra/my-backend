import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnClaudinary } from "../utils/claudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = User.findById(userId);
        const refreshToken = await user.generateRefreshToken();
        const accessToken = await user.generateAccessToken();
        user.refreshToken = refreshToken;
        user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error generating access and refresh token");
    }
}

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

const loginUser = asyncHandler(async (req, res) => {
    //take data from front end -> username or email and password
    const { email, username, password } = req.body;
    if (!username && !password) {
        throw new ApiError(400, "username or email required");
    }

    //find user
    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        throw new ApiError(400, "User does nto exist");
    }
    //match bcrypt password
    const isValidPassword = await user.isPasswordCorrect(password);
    if (!isValidPassword) {
        throw new ApiError(401, "Incorrect password");
    }

    // access token, refresh token generate
    const { accessToken, refreshToken } = generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    // send cookies 
    const option = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                }
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))

})

export { registerUser, loginUser, logoutUser };