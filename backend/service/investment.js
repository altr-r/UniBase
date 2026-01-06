const { createConnection } = require("../connectionDB");

let database;
const getConnection = async () => {
  if (!database) {
    database = await createConnection();
  }
  return database;
};

const makeInvestmentService = async (
  investorId,
  startupId,
  amount,
  roundSeq,
  equity
) => {
  const db = await getConnection();

  // 1. Verify Investor Role
  const [roleCheck] = await db.execute(
    "SELECT 1 FROM investors WHERE user_id = ?",
    [investorId]
  );
  if (roleCheck.length === 0) {
    const error = new Error("Only investors can make investments");
    error.status = 403;
    throw error;
  }

  // 2. Insert Investment (NOW WITH EQUITY)
  // We use "ON DUPLICATE KEY UPDATE" just in case they invest twice in the same round
  await db.execute(
    `INSERT INTO Invests (investor_id, startup_id, round_seq, amount, equity_share) 
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE amount = amount + VALUES(amount), equity_share = equity_share + VALUES(equity_share)`,
    [investorId, startupId, roundSeq, amount, equity || 0] // Default to 0 if null
  );

  return { message: "Investment successful" };
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
