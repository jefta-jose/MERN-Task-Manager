const Task = require("../models/Task");
const User = require("../models/User");
const excelJs = require("exceljs");

// Shared utility functions
const createWorkbookWithHeaders = (worksheetName, columns) => {
    const workbook = new excelJs.Workbook();
    const worksheet = workbook.addWorksheet(worksheetName);
    worksheet.columns = columns;
    return { workbook, worksheet };
};

const setExcelResponseHeaders = (res, filename) => {
    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
    );
};

const formatAssignedUsers = (assignedTo) => {
    return Array.isArray(assignedTo)
        ? assignedTo.map(user => `${user.name} (${user.email})`).join(", ")
        : assignedTo
            ? `${assignedTo.name} (${assignedTo.email})`
            : "Unassigned";
};

const formatDate = (date) => {
    return date ? date.toISOString().split("T")[0] : "N/A";
};

// Main service functions
const exportTaskReportService = async (res) => {
    try {
        const tasks = await Task.find().populate("assignedTo", "name email");

        const { workbook, worksheet } = createWorkbookWithHeaders("Task Reports", [
            { header: "Task ID", key: "_id", width: 25 },
            { header: "Title", key: "title", width: 30 },
            { header: "Description", key: "description", width: 50 },
            { header: "Priority", key: "priority", width: 15 },
            { header: "Status", key: "status", width: 20 },
            { header: "Due Date", key: "dueDate", width: 20 },
            { header: "Assigned To", key: "assignedTo", width: 30 },
        ]);

        tasks.forEach((task) => {
            worksheet.addRow({
                _id: task._id.toString(),
                title: task.title || "",
                description: task.description || "",
                priority: task.priority || "",
                status: task.status || "",
                dueDate: formatDate(task.dueDate),
                assignedTo: formatAssignedUsers(task.assignedTo)
            });
        });

        setExcelResponseHeaders(res, "tasks_report.xlsx");
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        throw error; // Let Express handle the error
    }
};

const exportUserReportService = async(res) => {
    try {
        const users = await User.find().select("name email _id").lean();
        const userTasks = await Task.find().populate("assignedTo", "name email _id");

        const userTaskMap = {};
        users.forEach((user) => {
            userTaskMap[user._id] = {
                name: user.name,
                email: user.email,
                taskCount: 0,
                pendingTasks: 0,
                inProgressTasks: 0,
                completedTasks: 0,
            };
        });

        userTasks.forEach((task) => {
            if(task.assignedTo){
                task.assignedTo.forEach((assignedUser) => {
                    if(userTaskMap[assignedUser._id]){
                        userTaskMap[assignedUser._id].taskCount += 1;

                        if(task.status === "Pending"){
                            userTaskMap[assignedUser._id].pendingTasks += 1;
                        } else if(task.status === "In Progress"){
                            userTaskMap[assignedUser._id].inProgressTasks += 1;
                        } else if(task.status === "Completed"){
                            userTaskMap[assignedUser._id].completedTasks += 1;
                        }
                    }
                });
            }
        });

        const { workbook, worksheet } = createWorkbookWithHeaders("User Task Reports", [
            {header: "User Name", key: "name", width: 30},
            {header: "Email", key: "email", width: 40},
            {header: "Total Assigned Tasks", key: "taskCount", width: 20},
            {header: "Pending Tasks", key: "pendingTasks", width: 20},
            {header: "In Progress Tasks", key: "inProgressTasks", width: 20},
            {header: "Completed Tasks", key: "completedTasks", width: 20},
        ]);

        Object.values(userTaskMap).forEach((user) => {
            worksheet.addRow(user);
        });

        setExcelResponseHeaders(res, "users_report.xlsx");
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        throw error; // Let Express handle the error
    }
};

module.exports = {
    exportTaskReportService,
    exportUserReportService
};