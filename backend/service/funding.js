const { createConnection } = require("../connectionDB");

let database;
const getConnection = async () => {
  if (!database) {
    database = await createConnection();
  }
  return database;
};

const openFundingRoundService = async (userId, data) => {
  const db = await getConnection();
  const { startup_id, amount, date, label } = data;

  const [founderCheck] = await db.execute(
    "SELECT 1 FROM Creates WHERE founder_id = ? AND startup_id = ?",
    [userId, startup_id]
  );

  if (founderCheck.length === 0) {
    const error = new Error(
      "Permission Denied: You are not the founder of this startup."
    );
    error.status = 403;
    throw error;
  }

  const [rounds] = await db.execute(
    "SELECT MAX(round_seq) as maxSeq FROM Funding_Rounds WHERE startup_id = ?",
    [startup_id]
  );

  const currentMax = rounds[0].maxSeq || 0;
  const nextSeq = currentMax + 1;

  const finalLabel = label || `Round ${nextSeq}`;

  await db.execute(
    `INSERT INTO Funding_Rounds (startup_id, round_seq, label, amount, date) 
     VALUES (?, ?, ?, ?, ?)`,
    [startup_id, nextSeq, finalLabel, amount, date || new Date()]
  );

  return {
    message: "Funding round opened successfully",
    round_seq: nextSeq,
    label: finalLabel,
    startup_id: startup_id,
  };
};

const getStartupFundingHistoryByIDService = async (startupId) => {
  const db = await getConnection();

  const [rounds] = await db.execute(
    "SELECT * FROM Funding_Rounds WHERE startup_id = ? ORDER BY round_seq ASC",
    [startupId]
  );


  const [investments] = await db.execute(
    `
    SELECT 
      round_seq, 
      COUNT(investor_id) as investor_count, 
      SUM(amount) as raised_so_far
    FROM Invests 
    WHERE startup_id = ?
    GROUP BY round_seq
  `,
    [startupId]
  );

  const history = rounds.map((round) => {
    const invData = investments.find(
      (inv) => inv.round_seq === round.round_seq
    );
    return {
      ...round,
      raised_amount: invData ? invData.raised_so_far : 0,
      investor_count: invData ? invData.investor_count : 0,
      target_met: invData && invData.raised_so_far >= round.amount,
    };
  });

  return history;
};

module.exports = { openFundingRoundService, getStartupFundingHistoryByIDService };
