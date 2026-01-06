const router = require("express").Router();
const {
  createStartup,
  getAllStartups,
  getStartupById,
  updateStartup,
  deleteStartup,
  getMyStartups,
  getSectors,
  getTags
} = require("../controller/startup");
const authenticateToken = require("../middleware/auth");

router.get("/", getAllStartups);
router.post("/", authenticateToken, createStartup);

router.get("/me", authenticateToken, getMyStartups);
router.get("/sectors", getSectors);
router.get("/tags", getTags);

router.get("/:id", getStartupById);
router.put("/:id", authenticateToken, updateStartup);
router.delete("/:id", authenticateToken, deleteStartup);



module.exports = router;
