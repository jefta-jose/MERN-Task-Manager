const express = require("express");
const {updateUserProfile, getUserProfile, loginUser, registerUser} = require("../controllers/authController");
const {protect} = require("../middlewares/authMiddlewear");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

module.exports = router;