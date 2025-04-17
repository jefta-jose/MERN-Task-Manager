const determinUserRole = require("../helperFunctions/determineRole");
const hashPassword = require("../helperFunctions/hashPassword");
const User = require("../models/User");

const getUserByEmail = async(email) => {
    try {
        const userFound = await User.findOne({email});
        return userFound;
    } catch (error) {
        return error;        
    }
};

const registerUserService = async(name, email, password, profileImageUrl, adminInviteToken) => {
    try {
        //check user role
        const userRole = determinUserRole(adminInviteToken);

        //hash password 
        const hashedPassword = await hashPassword(password);

        //create the new user
        const createdUser = await User.create({
            name,
            email,
            password: hashedPassword,
            profileImageUrl,
            role: userRole
        });

        return createdUser;

    } catch (error) {
        return error;
    }
};

const getUserByIdService = async(userId)=>{
    try {
        const user = await User.findById(userId).select("-password");
        return user;
    } catch (error) {
        return error;
    }
};

module.exports = {registerUserService, getUserByEmail, getUserByIdService};