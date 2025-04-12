const { serverError, notFound, ok } = require("../helperFunctions/responseHelper");
const { getUsersAndTasks } = require("../services/userServices");
const {getUserById} = require("../services/authServices");


//@desc GET all users (Admins Only)
//@route GET /api/users/
// access private (Admin)
const getUsers = async(req, res)=>{
    try {
        //get user details and their tasks
        const usersAndTaskDetails = await getUsersAndTasks();
        
        if(!usersAndTaskDetails){
            return notFound(res, "Users Not Found");
        }

        return ok(res, usersAndTaskDetails);

    } catch (error) {
        return serverError(res, error);
    }
}

//@desc GET user by id
//@route GET /api/users/:id
// access private
const getUser_ById = async(req, res)=>{
    try {

        const existingUser = await getUserById(req.user.id);
        if(!existingUser){
            return notFound(res, "User not found");
        }

        return ok(res, existingUser);

    } catch (error) {
        return serverError(res, error);
    }
}

//@desc DELETE a user (Admins Only)
//@route DELETE /api/users/:id
// access private (Admin)
const deleteUser = async(req, res)=>{
    try {
        
    } catch (error) {
        return serverError(res, error);
    }
}

module.exports = {getUsers, getUser_ById, deleteUser};