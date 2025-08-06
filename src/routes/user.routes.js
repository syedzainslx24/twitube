const express = require('express');
const {registerUser,loginUser,logoutUser,refreshAccessToken} = require('../controllers/user.controller');
const upload = require('../middlewears/multer.middleware');
const verifyJWT = require('../middlewears/auth.middleware');

const router = express.Router();

router.route("/register").post(
    upload.fields([
        {
        name:"avatar",
        maxCount:1
        },
        {
        name:"coverImage",
        maxCount:1
        }
    ]),
    registerUser);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT,logoutUser);

router.route("/refresh-token").post(refreshAccessToken);


module.exports = router;
