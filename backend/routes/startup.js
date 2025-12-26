const router = require("express").Router();
const {
  createStartup,
  getAllStartups,
  getStartupById,
  updateStartup,
  deleteStartup
} = require("../controller/startup");
const authenticateToken = require("../middleware/auth");

// Can be accessed by anynone
router.get("/", getAllStartups);
router.get("/:id", getStartupById);

// Only logged in users can access
router.post("/", authenticateToken, createStartup);
router.put("/:id", authenticateToken, updateStartup);
router.delete("/:id", authenticateToken, deleteStartup);

module.exports = router;