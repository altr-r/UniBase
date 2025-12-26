const {
  openFundingRoundService,
  getStartupFundingHistoryByIDService,
} = require("../service/funding");

const openFundingRound = async (req, res) => {
  const userId = req.user.userId;
  const data = req.body;

  if (!data.startup_id || !data.amount) {
    return res
      .status(400)
      .json({ message: "Startup ID and Amount are required." });
  }

  try {
    const result = await openFundingRoundService(userId, data);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};

const getStartupFundingHistoryByID = async (req, res) => {
  const { startupId } = req.params;
  try {
    const history = await getStartupFundingHistoryByIDService(startupId);
    return res.status(200).json(history);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { openFundingRound, getStartupFundingHistoryByID };
