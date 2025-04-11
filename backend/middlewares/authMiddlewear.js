const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { unauthorized, serverError } = require("../helperFunctions/responseHelper");

//Middlewear to protect routes
const protect = async( req, res, next) => {
    try {
        let token = req.headers.authorization;

        if(token && token.startsWith("Bearer")){
            token = token.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            next();
        } else{
            return unauthorized(res, "Not Authorized , no token");
        }
    } catch (error) {
        return serverError(res, error);
    }
};

//Middleear for admin-access only
const adminOnly = (req, res, next) => {
    if(req.user && req.user.role === "admin"){
        next();
    } else{
        return unauthorized(res, "You Don't have the correct role for this operation");
    }
}

module.exports = {protect, adminOnly};