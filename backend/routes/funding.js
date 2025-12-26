const router = require("express").Router();
const {
  openFundingRound,
  getStartupFundingHistoryByID,
} = require("../controller/funding");
const authenticateToken = require("../middleware/auth");

router.post("/", authenticateToken, openFundingRound);

router.get("/:startupId", getStartupFundingHistoryByID);

module.exports = router;
