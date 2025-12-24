const router = require("express").Router();
const { getUserProfile, updateUserProfile } = require("../controller/user");
const authenticateToken = require("../middleware/auth");

router.get("/me", authenticateToken, getUserProfile);

router.put("/me", authenticateToken, updateUserProfile);

module.exports = router;
