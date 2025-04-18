const redisClient = require("../config/redisConfiguration");
const { serverError, badRequest, ok, notFound } = require("../helperFunctions/responseHelper");
const Task = require("../models/Task");
const { createTaskService, filterAdminTasks, filterMemberTasks, todoChecklistCount, taskSummaryCount, getTaskByIdService, fetchStatisticsService, taskChartSerivice, fetchUserStatisticsService, userTaskChartSerivice } = require("../services/taskServices");

//@ desc Get all Tasks {Admin: all, User: assigned tasks}
//@ route GET api/tasks/
//@ access private
const getTasks = async(req, res)=>{
    try {
        const {status} = req.query;

        let filter = {};

        if(status){
            filter.status = status;
        };

        let tasks;

        if(req.user.role === "admin"){
            tasks = await filterAdminTasks(filter);
        } else{
            const memberId = req.user._id;

            tasks = await filterMemberTasks(filter, memberId);
        };

        // Add completed todo checklist count to each task
        tasks = await todoChecklistCount(tasks);

        const taskSummary = await taskSummaryCount(req.user.role, req.user._id, filter);

        const response = {tasks  , statusSummary: taskSummary};

        return ok(res, response);

    } catch (error) {
        return serverError(res, error);
    }
}

//@ desc Get task by id
//@ route GET api/tasks/:id
//@ access private
const getTaskById = async(req, res)=>{
    try {
        const taskId = req.params.id;

        const task = await getTaskByIdService(taskId);

        if(task){
            return ok(res, task)
        } else{
            return notFound(res, `task with id ${taskId} was not found`)
        }

    } catch (error) {
        return serverError(res, error);
    }
}

//@ desc create a new task
//@ route POST api/tasks/:id
//@ access private (Admin)
const createTask = async(req, res)=>{
    try {

        console.log("request body:",req.body);

        const {
            title,
            description,
            priority,
            status,
            dueDate,
            assignedTo,
            attachments,
            todoChecklist,
            process
          } = req.body;

        if(!Array.isArray(assignedTo)){
            console.log("assignedTo Array:", assignedTo);
            return badRequest(res, "assigned to must be an array of user IDs");
        };

        const taskPayload = {
            title,
            description,
            priority,
            status,
            dueDate,
            assignedTo,
            createdBy: req.user._id,
            attachments,
            todoChecklist,
            process
          };

        const createdTask = await createTaskService( taskPayload );

        // Invalidate dashboard cache
        await redisClient.del("getDashboardData");

        return ok(res, createdTask);

    } catch (error) {
        return serverError(res, error);
    }
}

//@ desc Update Task Details
//@ route PUT api/tasks/:id
//@ access private
const updateTask = async(req, res)=>{
    try {
        
        const taskId = req.params.id;

        const task = await getTaskByIdService(taskId);

        if(!task){
            return notFound(res, `task with id: ${taskId} was not found`);
        }

        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.priority = req.body.priority || task.priority;
        task.dueDate = req.body.dueDate || task.dueDate;
        task.todoChecklist = req.body.todoChecklist || task.todoChecklist;
        task.attachments = req.body.attachments || task.attachments;

        if(req.body.assignedTo){
            if(!Array.isArray(req.body.assignedTo)) {
                return badRequest(res, "assigned to must be an array of user id's");
            }
            task.assignedTo = req.body.assignedTo;
        }

        const updatedTask = await task.save();

        return ok(res, updatedTask);

    } catch (error) {
        return serverError(res, error);
    }
}

//@ desc delete task
//@ route DELETE api/tasks/:id
//@ access private (Admin)
const deleteTask = async(req, res)=>{
    try {
        const taskId = req.params.id;

        const taskToDelete = await getTaskByIdService(taskId);

        if(!taskToDelete){
            return notFound(res, `task with ID: ${taskId} does not exist`);
        }

        await taskToDelete.deleteOne();

        return ok(res, "task successfully deleted");

    } catch (error) {
        return serverError(res, error);
    }
}

//@ desc Update Task status
//@ route PUT api/tasks/:id/status
//@ access private
const updateTaskStatus = async(req, res)=>{
    try {
        const taskId = req.params.id;

        const task = await getTaskByIdService(taskId);

        if(!task){
            return notFound(task, "task not found");
        }

        //here we are checking if the user updating the task has been assigned that task
        const isAssigned = task.assignedTo.some(
            (userId) => userId.toString() === req.user._id.toString()
        );

        if(!isAssigned && req.user.role != "admin"){
            return badRequest(res, "not authorized");
        }

        task.status = req.body.status || task.status;

        if(task.status === "Completed"){
            task.todoChecklist.forEach((item) => (item.completed = true));
            task.progress = 100;
        }

        const updatedTask = await task.save();

        return ok(res, updatedTask);

    } catch (error) {
        return serverError(res, error);
    }
}

//@ desc Update Task Checklist
//@ route PUT api/tasks/:id/todo
//@ access private
const updateTaskChecklist = async(req, res)=>{
    try {
        
        const taskId = req.params.id;

        console.log("taskId:", taskId);

        const {todoChecklist} = req.body;

        const task = await getTaskByIdService(taskId);

        console.log("task:", task);

        if(!task){
            return notFound(task, "task not found");
        }

        if(!task.assignedTo.includes(req.user._id) && req.user.role !== "admin"){
            return badRequest(res, "user is not authorized to perform this role");
        }

        task.todoChecklist = todoChecklist;

        //Auto-update progress based on checklist completion
        const completedCount = task.todoChecklist.filter( (item) => item.completed).length;
        const totalItems = task.todoChecklist.length;
        task.progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0 ;

        //Auto mark tast as completed if all items are checked
        if(task.progress === 100){
            task.status = "Completed";
        } else if(task.progress > 0){
            task.status = "In Progress";
        } else{
            task.status = "Pending";
        }

        await task.save();

        const updatedTask = await Task.findById(taskId).populate(
            "assignedTo",
            "name email profileImageUrl"
        );

        const respone = {task: updatedTask};

        return ok(res, respone);

    } catch (error) {
        return serverError(res, error);
    }
}

//@ desc Dashboard data (Admin only)
//@ route GET api/tasks/dashboard-data
//@ access private
const getDashboardData = async (req, res) => {
    const cacheKey = "getDashboardData";

    try {
        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            return ok(res, JSON.parse(cachedData));
        }

        const [fetchStatistics, fetchCharts, recentTasks] = await Promise.all([
            fetchStatisticsService(),
            taskChartSerivice(),
            Task.find().sort({ createAt: -1 })
                .limit(10)
                .select("title status priority dueDate createdAt")
        ]);

        const response = {
            fetchStatistics,
            fetchCharts,
            recentTasks,
        };

        // Proper way to set data with expiration
        await redisClient.set(cacheKey, JSON.stringify(response), { EX: 3600 });

        return ok(res, response);

    } catch (error) {
        return serverError(res, error);
    }
}


//@ desc Dashboard data (User Specifi)
//@ route GET api/tasks/user-dashboard-data
//@ access private
const getUsertDashboardData = async(req, res)=>{
    try {
        const userId = req.user._id;

        const cacheKey = "getUserDashboardData";

        try {
            const cachedData = await redisClient.get(cacheKey);
    
            if (cachedData) {
                return ok(res, JSON.parse(cachedData));
            }
    
            const [fetchStatistics, fetchCharts, recentTasks] = await Promise.all([
                fetchUserStatisticsService(userId),
                userTaskChartSerivice(userId),
                Task.find({assignedTo: userId}).sort({ createAt: -1 })
                    .limit(10)
                    .select("title status priority dueDate createdAt")
            ]);
    
            const response = {
                fetchStatistics,
                fetchCharts,
                recentTasks,
            };
    
            // Proper way to set data with expiration
            await redisClient.set(cacheKey, JSON.stringify(response), { EX: 3600 });
    
            return ok(res, response);
    
        } catch (error) {
            return serverError(res, error);
        }
    } catch (error) {
        return serverError(res, error);
    }
}

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskChecklist,
    getDashboardData,
    getUsertDashboardData
}