const express = require("express");
const {protect, adminOnly} = require("../middlewares/authMiddlewear");
const {exportTasksReport, exportUsersReport} = require("../controllers/reportController");

const router = express.Router();

router.get("/export/tasks", protect, adminOnly, exportTasksReport); // Export all Tasks as pdf
router.get("/export/users", protect, adminOnly, exportUsersReport); // Export user-task report

module.exports = router;