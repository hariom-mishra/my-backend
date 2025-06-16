import { Router } from "express";
import { loginUser, registerUser, logoutUser, refreshAccessToken, updatePassword, getCurrentUser, updateAccount, updateAvatar, updateCoverImage, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(
    upload.fields([
        {
            "name": "avatar",
            "maxCount": 1
        },
        {
            "name": "coverImage",
            "maxCount": 1
        }
    ]),
    registerUser,
);

userRouter.route("/login").post(
    loginUser,
);

//secured routes
userRouter.route("/logout").post(
    verifyJWT,
    logoutUser,
);

userRouter.route("/refresh-token").post(
    refreshAccessToken
)

userRouter.route("/change-password").post(
    verifyJWT,
    updatePassword
)

userRouter.route("/current-user").post(
    verifyJWT,
    getCurrentUser
)

userRouter.route("/update-account").patch(
    verifyJWT,
    updateAccount,
)

userRouter.route("/update-avatar").patch(
    verifyJWT,
    upload.single("avatar"),
    updateAvatar
)

userRouter.route("/cover-image").patch(
    verifyJWT,
    upload.single("cover-image"),
    updateCoverImage
)

userRouter.route("/c/:username/").get(
    verifyJWT,
    getUserChannelProfile
)

userRouter.route("/watch-history").get(
    verifyJWT,
    getWatchHistory
)

export default userRouter;