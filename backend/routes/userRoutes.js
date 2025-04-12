const express = require("express");
const {adminOnly , protect} = require("../middlewares/authMiddlewear");
const {getUsers, getUser_ById, deleteUser} = require("../controllers/userController")

const router = express.Router();

router.get("/", protect, adminOnly, getUsers); // get all users admin only role
router.get("/:id", protect, getUser_ById);
router.delete("/:id", adminOnly, deleteUser); // delete a user admin only 

module.exports = router;