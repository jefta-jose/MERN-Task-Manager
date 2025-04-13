const { serverError, badRequest, ok } = require("../helperFunctions/responseHelper");
const { createTaskService, filterAdminTasks, filterMemberTasks, todoChecklistCount, taskSummaryCount } = require("../services/taskServices");

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
        
    } catch (error) {
        return serverError(res, error);
    }
}

//@ desc delete task
//@ route DELETE api/tasks/:id
//@ access private (Admin)
const deleteTask = async(req, res)=>{
    try {
        
    } catch (error) {
        return serverError(res, error);
    }
}

//@ desc Update Task status
//@ route PUT api/tasks/:id/status
//@ access private
const updateTaskStatus = async(req, res)=>{
    try {
        
    } catch (error) {
        return serverError(res, error);
    }
}

//@ desc Update Task Checklist
//@ route PUT api/tasks/:id/todo
//@ access private
const updateTaskChecklist = async(req, res)=>{
    try {
        
    } catch (error) {
        return serverError(res, error);
    }
}

//@ desc Dashboard data (Admin only)
//@ route GET api/tasks/dashboard-data
//@ access private
const getDashboardData = async(req, res)=>{
    try {
        
    } catch (error) {
        return serverError(res, error);
    }
}

//@ desc Dashboard data (User Specifi)
//@ route GET api/tasks/user-dashboard-data
//@ access private
const getUsertDashboardData = async(req, res)=>{
    try {
        
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