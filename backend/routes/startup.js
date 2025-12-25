const router = require("express").Router();
const {
  createStartup,
  getAllStartups,
  getStartupById,
  updateStartup,
  deleteStartup
} = require("../controller/startup");
const authenticateToken = require("../middleware/auth");

// Public Routes
router.get("/", getAllStartups);
router.get("/:id", getStartupById);

// Protected Routes
router.post("/", authenticateToken, createStartup);
router.put("/:id", authenticateToken, updateStartup);
router.delete("/:id", authenticateToken, deleteStartup);

module.exports = router;