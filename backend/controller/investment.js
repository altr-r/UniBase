const {
  makeInvestmentService,
  getInvestorPortfolioService,
} = require("../service/investment");

const makeInvestment = async (req, res) => {
  const { startup_id, amount, round_seq, equity } = req.body; // <--- Extract 'equity'
  const investor_id = req.user.userId;

  if (!startup_id || !amount || !round_seq) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await makeInvestmentService(
      investor_id,
      startup_id,
      amount,
      round_seq,
      equity
    );
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
