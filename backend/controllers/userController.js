const { serverError, notFound, ok } = require("../helperFunctions/responseHelper");
const { getUsersAndTasks, getAdminsService } = require("../services/userServices");
const {getUserByIdService} = require("../services/authServices");


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

//@desc GET all admins (Admins Only)
//@route GET /api/users/admins
// access private (Admin)
const getAdmins = async(req, res)=>{
    try {
        //get user details and their tasks
        const admins = await getAdminsService();
        
        console.log("reached here");

        if(!admins){
            return notFound(res, "admins Not Found");
        }

        return ok(res, admins);

    } catch (error) {
        return serverError(res, error);
    }
}

//@desc GET user by id
//@route GET /api/users/:id
// access private
const getUserById = async(req, res)=>{
    try {

        const existingUser = await getUserByIdService(req.params.id);
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
        const userId = req.params.id;
        
        const userToDelete = await getUserByIdService(userId);

        if(!userToDelete){
            return notFound(res, "User Not Found");
        }

        await userToDelete.deleteOne();

        return ok(res, "User Delete Successfully");
    } catch (error) {
        return serverError(res, error);
    }
}

module.exports = {getUsers, getUserById, deleteUser, getAdmins};