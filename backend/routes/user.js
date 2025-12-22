const router = require("express").Router();
const { getUserProfile } = require("../controller/user");
const authenticateToken = require("../middleware/auth");

router.get("/me", authenticateToken, getUserProfile);

module.exports = router;