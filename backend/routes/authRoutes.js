const express = require("express");
const {updateUserProfile, getUserProfile, loginUser, registerUser} = require("../controllers/authController");
const {protect} = require("../middlewares/authMiddlewear");
const upload = require("../middlewares/uploadMiddlewear");
const { notFound, ok } = require("../helperFunctions/responseHelper");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

router.post("/upload-image", upload.single("image"), (req, res)=> {
    if(!req.file){
        return notFound(res, "file to upload not found");
    };

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    return ok(res, imageUrl);
});

module.exports = router;