const express = require("express");
const {adminOnly , protect} = require("../middlewares/authMiddlewear");
const {getUsers, getUserById, deleteUser, getAdmins} = require("../controllers/userController")

const router = express.Router();

router.get("/", protect, adminOnly, getUsers); // get all users admin only role
router.get("/admins", protect, adminOnly, getAdmins); // get all admins admin only role
router.get("/:id", protect, getUserById);
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;