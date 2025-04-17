const Task = require("../models/Task");

const createTaskService = async(taskData)=>{
    try {
        const newTask = await Task.create(taskData);

        return newTask;

    } catch (error) {
        return error;        
    }
}


const filterAdminTasks = async(filter)=>{
    try {
        const tasks = await Task.find(filter).populate(
            "assignedTo",
            "name email profileImageUrl"
        );

        return tasks;

    } catch (error) {
        return error;
    }
}

const filterMemberTasks = async(filter, memberId)=>{
    try {
        const tasks = await Task.find({...filter, assignedTo:memberId}).populate(
            "assignedTo",
            "name email profileImageUrl"
        );

        return tasks;
    } catch (error) {
        return error;
    }
}

const todoChecklistCount = async(tasks)=>{
    try {
        tasks = await Promise.all(
            tasks.map(async (task) => {
                const completedCount = task.todoChecklist.filter((item) => item.completed).length;
                return {...task._doc, completedTodoCount: completedCount};
            })
        );

        return tasks;
        
    } catch (error) {
        return error;
    }
}

const taskSummaryCount = async(role, userId, filter)=>{
    try {

        const allTasks = await Task.countDocuments(
            role === "admin" ? {} : {assignedTo: userId}
        );

        const pendingTasks = await Task.countDocuments({
            ...filter,
            status: "Pending",
            ...(role  !== "admin" && {assignedTo: userId}),
        });

        const inProgressTasks = await Task.countDocuments({
            ...filter,
            status: "In Progress",
            ...(role  !== "admin" && {assignedTo: userId}),
        });

        const completedTasks = await Task.countDocuments({
            ...filter,
            status: "Completed",
            ...(role  !== "admin" && {assignedTo: userId}),
        });

        return {allTasks, pendingTasks, inProgressTasks, completedTasks};

    } catch (error) {
        return error;
    }
}

const getTaskByIdService = async(taskId)=> {
    try {
        const task = await Task.findById(taskId).populate(
            "assignedTo",
            "name email profileImageUrl"
        );

        return task;

    } catch (error) {
        return error;
    }
}

const updateTaskService = async()=> {
    try {
        
    } catch (error) {
        return error;
    }
}

module.exports = {
    createTaskService,
    filterAdminTasks,
    filterMemberTasks,
    todoChecklistCount,
    taskSummaryCount,
    getTaskByIdService,
};