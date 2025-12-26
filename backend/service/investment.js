const { createConnection } = require("../connectionDB");

let database;
const getConnection = async () => {
  if (!database) {
    database = await createConnection();
  }
  return database;
};

const makeInvestmentService = async (userId, data) => {
  const db = await getConnection();
  const { startup_id, round_seq, amount, equity_share } = data;

  const [investorCheck] = await db.execute(
    "SELECT 1 FROM Investors WHERE user_id = ?",
    [userId]
  );

  if (investorCheck.length === 0) {
    const error = new Error(
      "Permission Denied: Only registered Investors can make investments."
    );
    error.status = 403;
    throw error;
  }

  const [roundCheck] = await db.execute(
    "SELECT 1 FROM Funding_Rounds WHERE startup_id = ? AND round_seq = ?",
    [startup_id, round_seq]
  );

  if (roundCheck.length === 0) {
    const error = new Error("Funding Round not found.");
    error.status = 404;
    throw error;
  }

  await db.execute(
    `INSERT INTO Invests (investor_id, startup_id, round_seq, amount, equity_share) 
     VALUES (?, ?, ?, ?, ?)`,
    [userId, startup_id, round_seq, amount, equity_share || 0]
  );

  return {
    message: "Investment successful!",
    investment: { startup_id, round_seq, amount, equity_share },
  };
};

const getInvestorPortfolioService = async (userId) => {
  const db = await getConnection();

  const query = `
    SELECT 
      i.amount, i.equity_share, i.round_seq,
      s.startup_id, s.name as startup_name, s.logo_url, s.status,
      f.label as round_label
    FROM Invests i
    JOIN Startups s ON i.startup_id = s.startup_id
    JOIN Funding_rounds f ON i.startup_id = f.startup_id AND i.round_seq = f.round_seq
    WHERE i.investor_id = ?
    ORDER BY f.date DESC
  `;

  const [rows] = await db.execute(query, [userId]);
  return rows;
};

module.exports = { makeInvestmentService, getInvestorPortfolioService };
