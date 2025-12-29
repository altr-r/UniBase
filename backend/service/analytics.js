const { createConnection } = require("../connectionDB");

let database;
const getConnection = async () => {
  if (!database) {
    database = await createConnection();
  }
  return database;
};

const getStartupAnalyticsService = async (startupId) => {
  const db = await getConnection();

  const [ratingRows] = await db.execute(`
    SELECT 
      COUNT(*) as total_reviews,
      IFNULL(AVG(score), 0) as avg_score
    FROM rates 
    WHERE startup_id = ?
  `, [startupId]);

  const [fundingRows] = await db.execute(`
    SELECT IFNULL(SUM(amount), 0) as total_raised 
    FROM invests 
    WHERE startup_id = ?
  `, [startupId]);

  const [likeRows] = await db.execute(`
    SELECT COUNT(*) as total_likes 
    FROM favorites 
    WHERE startup_id = ?
  `, [startupId]);

  return {
    startup_id: startupId,
    funding: parseFloat(fundingRows[0].total_raised),
    likes: likeRows[0].total_likes,
    ratings: {
      count: ratingRows[0].total_reviews,
      average: parseFloat(ratingRows[0].avg_score).toFixed(1)
    }
  };
};

const getLeaderboardService = async () => {
  const db = await getConnection();

  const query = `
    SELECT 
      s.startup_id, s.name, s.logo_url, s.sector, s.status,
      IFNULL(SUM(i.amount), 0) as total_raised
    FROM startups s
    LEFT JOIN invests i ON s.startup_id = i.startup_id
    GROUP BY s.startup_id
    ORDER BY total_raised DESC
    LIMIT 5
  `;

  const [rows] = await db.execute(query);
  return rows;
};

module.exports = { getStartupAnalyticsService, getLeaderboardService };