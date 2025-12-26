const {
  makeInvestmentService,
  getInvestorPortfolioService,
} = require("../service/investment");

const makeInvestment = async (req, res) => {
  const userId = req.user.userId;
  const data = req.body;

  if (!data.startup_id || !data.round_seq || !data.amount) {
    return res.status(400).json({
      message: "Startup ID, Round Sequence, and Amount are required.",
    });
  }

  try {
    const result = await makeInvestmentService(userId, data);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};

const getInvestorPortfolio = async (req, res) => {
  const userId = req.user.userId;
  try {
    const portfolio = await getInvestorPortfolioService(userId);
    return res.status(200).json(portfolio);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { makeInvestment, getInvestorPortfolio };
