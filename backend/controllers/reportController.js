const { serverError } = require("../helperFunctions/responseHelper");
const { exportTaskReportService, exportUserReportService } = require("../services/reportServices");

//@desc Export all tasks as an Excel file
//@route GET /api/reports/exports/tasks
//access Private(Admin)

const exportTaskReport = async(req, res)=>{
    try {
        const response = await exportTaskReportService(res);

        return ok(res, response);

    } catch (error) {
        return serverError(res, error);
    }
}

const exportUserReport = async(req, res)=>{
    try {
        const response = await exportUserReportService(res);

        return ok(res, response);
        
    } catch (error) {
        return serverError(res, error);
    }
}

module.exports = {exportTaskReport, exportUserReport};