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

const updateTaskStatusService = async(taskId)=> {
    try {
        
    } catch (error) {
        return error;
    }
}

const findTaskByIdService = async(taskId) =>{
    try {
        const task = Task.findById(taskId);

        return task;

    } catch (error) {
        return error;
    }
}

const fetchStatisticsService  = async()=>{
    try {
        const[totalTasks, pendingTasks, inProgressTasks, completedTasks, overDueTasks] = await Promise.all([
            Task.countDocuments(),
            Task.countDocuments({ status: "Pending" }),
             Task.countDocuments({ status: "In Progress" }),
            Task.countDocuments({ status: "Completed" }),
    
            Task.countDocuments({
                status: { $ne: "Completed" },
                dueDate: { $lt: new Date() },
            })
        ]);

        return {totalTasks, pendingTasks, inProgressTasks, completedTasks, overDueTasks};

    } catch (error) {
        return error;
    }
}

const fetchUserStatisticsService  = async(userId)=>{
    try {
        const[totalTasks, pendingTasks, inProgressTasks, completedTasks, overDueTasks] = await Promise.all([
            Task.countDocuments({assignedTo: userId}),
            Task.countDocuments({assignedTo: userId, status: "Pending" }),
             Task.countDocuments({assignedTo: userId, status: "In Progress" }),
            Task.countDocuments({assignedTo: userId, status: "Completed" }),
    
            Task.countDocuments({
                assignedTo: userId,
                status: { $ne: "Completed" },
                dueDate: { $lt: new Date() },
            })
        ]);

        return {totalTasks, pendingTasks, inProgressTasks, completedTasks, overDueTasks};

    } catch (error) {
        return error;
    }
}

const taskChartSerivice = async() => {
    try {

        //ensure all possible statuses are included 
        const taskStatuses = ["Pending", "In Progress", "Completed"];
        const taskDistributionRaw = await Task.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);

        const taskDistribution = taskStatuses.reduce((acc, status) => {
            //remove spaces for response keys
            const formattedKey = status.replace(/\s+/g, "");
            acc[formattedKey] = taskDistributionRaw.find((item) => item._id === status )?.count || 0;
            return acc;
        },  {});
        //add total count to task distribution
        taskDistribution["All"] = fetchStatisticsService.totalTasks;

        //ensure all prority levels are included
        const taskPriorities = ["Low", "Medium", "High"];
        const taskPriorityLevelsRaw = await Task.aggregate([
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 },
                },
            },
        ]);

        const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
            acc[priority] = taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0; 
            return acc;
        }, {});

        return {taskDistribution, taskPriorityLevels};

    } catch (error) {
        return error;
    }
}

const userTaskChartSerivice = async(userId) => {
    try {

        //ensure all possible statuses are included 
        const taskStatuses = ["Pending", "In Progress", "Completed"];
        const taskDistributionRaw = await Task.aggregate([
            {
                $match: {assignedTo: userId}
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);

        const taskDistribution = taskStatuses.reduce((acc, status) => {
            //remove spaces for response keys
            const formattedKey = status.replace(/\s+/g, "");
            acc[formattedKey] = taskDistributionRaw.find((item) => item._id === status )?.count || 0;
            return acc;
        },  {});
        //add total count to task distribution
        taskDistribution["All"] = fetchStatisticsService.totalTasks;

        //ensure all prority levels are included
        const taskPriorities = ["Low", "Medium", "High"];
        const taskPriorityLevelsRaw = await Task.aggregate([
            {
                $match: {assignedTo: userId}
            },
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 },
                },
            },
        ]);

        const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
            acc[priority] = taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0; 
            return acc;
        }, {});

        return {taskDistribution, taskPriorityLevels};

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
    updateTaskStatusService,
    findTaskByIdService,
    fetchStatisticsService,
    taskChartSerivice,
    fetchUserStatisticsService,
    userTaskChartSerivice
};