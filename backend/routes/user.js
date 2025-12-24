const router = require("express").Router();
const { getUserProfile, updateUserProfile, addUserRole } = require("../controller/user");
const authenticateToken = require("../middleware/auth");

router.get("/me", authenticateToken, getUserProfile);

router.put("/me", authenticateToken, updateUserProfile);

router.post("/role", authenticateToken, addUserRole);

module.exports = router;
