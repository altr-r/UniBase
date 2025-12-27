const { createConnection } = require("../connectionDB");

let database;
const getConnection = async () => {
  if (!database) {
    database = await createConnection();
  }
  return database;
};

const addCommentService = async (userId, startupId, content) => {
  const db = await getConnection();

  const [startupCheck] = await db.execute(
    "SELECT 1 FROM startups WHERE startup_id = ?",
    [startupId]
  );
  if (startupCheck.length === 0) {
    const error = new Error("Startup not found.");
    error.status = 404;
    throw error;
  }

  const [result] = await db.execute(
    "INSERT INTO comments (user_id, startup_id, content) VALUES (?, ?, ?)",
    [userId, startupId, content]
  );

  return { message: "Comment added successfully", comment_id: result.insertId };
};

const getCommentsService = async (startupId) => {
  const db = await getConnection();

  const query = `
    SELECT c.comment_id, c.content, c.created_at, u.name as user_name, u.photo_url
    FROM comments c
    JOIN users u ON c.user_id = u.user_id
    WHERE c.startup_id = ?
    ORDER BY c.created_at DESC
  `;

  const [rows] = await db.execute(query, [startupId]);
  return rows;
};

const toggleFavoriteService = async (userId, startupId) => {
  const db = await getConnection();

  const [existing] = await db.execute(
    "SELECT 1 FROM favorites WHERE user_id = ? AND startup_id = ?",
    [userId, startupId]
  );

  if (existing.length > 0) {
    await db.execute(
      "DELETE FROM favorites WHERE user_id = ? AND startup_id = ?",
      [userId, startupId]
    );
    return { message: "Removed from favorites", is_favorited: false };
  } else {
    await db.execute(
      "INSERT INTO favorites (user_id, startup_id) VALUES (?, ?)",
      [userId, startupId]
    );
    return { message: "Added to favorites", is_favorited: true };
  }
};

const getFavoriteCountService = async (startupId) => {
  const db = await getConnection();
  const [rows] = await db.execute(
    "SELECT COUNT(*) as count FROM favorites WHERE startup_id = ?",
    [startupId]
  );
  return rows[0].count;
};

const getMyFavoritesService = async (userId) => {
  const db = await getConnection();

  const query = `
    SELECT s.startup_id, s.name, s.logo_url, s.sector, s.status, f.added_at
    FROM favorites f
    JOIN startups s ON f.startup_id = s.startup_id
    WHERE f.user_id = ?
    ORDER BY f.added_at DESC
  `;

  const [rows] = await db.execute(query, [userId]);
  return rows;
};

const addRatingService = async (userId, startupId, data) => {
  const db = await getConnection();
  const { score, feedback } = data;

  if (!score || score < 1 || score > 10) {
    throw new Error("Score must be between 1 and 10.");
  }

  const query = `
    INSERT INTO rates 
    (user_id, startup_id, score, feedback, date)
    VALUES (?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
    score = VALUES(score),
    feedback = VALUES(feedback),
    date = NOW()
  `;

  await db.execute(query, [userId, startupId, score, feedback || null]);

  return { message: "Rating submitted successfully" };
};

const getStartupRatingsService = async (startupId) => {
  const db = await getConnection();

  const query = `
    SELECT r.score, r.feedback, r.date,
           u.name as user_name, u.photo_url
    FROM rates r
    JOIN users u ON r.user_id = u.user_id
    WHERE r.startup_id = ?
    ORDER BY r.date DESC
  `;

  const [rows] = await db.execute(query, [startupId]);
  return rows;
};

module.exports = {
  addCommentService,
  getCommentsService,
  toggleFavoriteService,
  getFavoriteCountService,
  getMyFavoritesService,
  addRatingService,
  getStartupRatingsService,
};
