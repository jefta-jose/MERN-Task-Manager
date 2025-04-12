const { serverError } = require("../helperFunctions/responseHelper")

//@ desc Get all Tasks {Admin: all, User: assigned tasks}
//@ route GET api/tasks/
//@ access private
const getDashboardData = async(req, res)=>{
    try {
        
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

//@ desc Get task by id
//@ route GET api/tasks/:id
//@ access private
const getTaskById = async(req, res)=>{
    try {
        
    } catch (error) {
        return serverError(res, error);
    }
}