const { getStartupAnalyticsService, getLeaderboardService } = require("../service/analytics");

const getStartupAnalytics = async (req, res) => {
  const { startupId } = req.params;
  try {
    const data = await getStartupAnalyticsService(startupId);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const data = await getLeaderboardService();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { getStartupAnalytics, getLeaderboard };