const generateToken = require("../helperFunctions/generateToken");
const hashPassword = require("../helperFunctions/hashPassword");
const isMatch = require("../helperFunctions/passwordComparer");
const { serverError, ok, badRequest, notFound } = require("../helperFunctions/responseHelper");
const { registerUserService, getUserByEmail, getUserByIdService } = require("../services/authServices");


// @desc register a new user 
// @route POST /api/auth/register
// @access public
const registerUser = async(req, res) => {
    try {
        const {name, email, password, profileImageUrl, adminInviteToken} = req.body;

        //check if user exists
        const existingUser = await getUserByEmail(email);
        if(existingUser){
            return badRequest(res, "user already exists");
        };

        //create a new user 
        const newUser = await registerUserService(name, email, password, profileImageUrl, adminInviteToken);
        return ok(res, newUser);

    } catch (error) {
        return serverError(res, error);
    }
};

// @desc login user
// @route POST /api/auth/login
// @access public
const loginUser = async(req, res) => {
    try {
        const {email, password} = req.body;

        //check if user exists
        const existingUser = await getUserByEmail(email);
        if(!existingUser){
            return notFound(res, "User Not Found!");
        };

        //compare passwords
        isMatch(password, existingUser.password, res);

        // return user details after login in with jwt
        const userData = {
            _id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
            profileImageUrl: existingUser.profileImageUrl,
            token: generateToken(existingUser._id)
        };

        return ok(res, userData);
    } catch (error) {
        return serverError(res, error);
    }
};

// @desc get user profile
// @route GET /api/auth/profile
// @access Private (Requires JWT)
const getUserProfile = async(req, res) => {
    try {
        const existingUser = await getUserByIdService(req.user.id);

        if(!existingUser){
            return notFound(res, "User Does Not Exist");
        }

        return ok(res, existingUser);
    } catch (error) {
        return serverError(res, error);
    }
};

// @desc update user profile
// @route PUT /api/auth/profile
// @access Private (Requires JWT)
const updateUserProfile = async(req, res) => {
    try {
        const existingUser = await getUserByIdService(req.user.id);
        if(!existingUser){
            return notFound(res, "User Does Not Exist");
        };

        const requestBody = req.body;

        existingUser.name = requestBody.name;
        existingUser.email = requestBody.email;

        if(requestBody.password){
            existingUser.password = hashPassword(requestBody.password);
        }

        const updatedUser = await user.save();

        const newUserDetails = {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            token: generateToken(updatedUser._id)
        };

        return ok(res, newUserDetails);

    } catch (error) {
        return serverError(res, error);
    }
};

module.exports = {registerUser, loginUser, getUserProfile, updateUserProfile};