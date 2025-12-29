const router = require("express").Router();
const { getStartupAnalytics, getLeaderboard } = require("../controller/analytics");

router.get("/leaderboard", getLeaderboard);

router.get("/:startupId", getStartupAnalytics);

module.exports = router;