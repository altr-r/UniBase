const router = require("express").Router();
const { openFundingRound } = require("../controller/funding");
const authenticateToken = require("../middleware/auth");

router.post("/", authenticateToken, openFundingRound);

module.exports = router;
