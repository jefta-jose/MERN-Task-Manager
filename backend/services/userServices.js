const User = require("../models/User");
const Task = require("../models/Task");

const getUsersAndTasks = async()=>{
    try {
        const users = await User.find({role: "member"}).select("-password");

        //include taks count to each user
        const usersWithTaskCounts = await Promise.all(users.map( async (user) => {
            const pendingTasks = await Task.countDocuments({assingedTo: user._id, status: "Pending"});
            const inProgressTasks = await Task.countDocuments({assingedTo: user._id, status: "In Progress"});
            const completedTasks = await Task.countDocuments({assingedTo: user._id, status: "Completed"});

            return {
                ...user._doc, //include all existing user data
                pendingTasks,
                inProgressTasks,
                completedTasks
            };

            }));

        return usersWithTaskCounts;
        
    } catch (error) {
        return error;
    }
};

const deleteUserService = async(userId)=>{
    try {
        
    } catch (error) {
        return error;
    }
}

module.exports = {getUsersAndTasks};