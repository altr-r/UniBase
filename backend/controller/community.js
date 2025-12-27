const {
  addCommentService,
  getCommentsService,
  toggleFavoriteService,
  getFavoriteCountService,
  getMyFavoritesService,
  addRatingService,
  getStartupRatingsService,
} = require("../service/community");

const addComment = async (req, res) => {
  const userId = req.user.userId;
  const { startupId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Comment content is required." });
  }

  try {
    const result = await addCommentService(userId, startupId, content);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};

const getComments = async (req, res) => {
  const { startupId } = req.params;
  try {
    const comments = await getCommentsService(startupId);
    return res.status(200).json(comments);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const toggleFavorite = async (req, res) => {
  const userId = req.user.userId;
  const { startupId } = req.params;

  try {
    const result = await toggleFavoriteService(userId, startupId);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getFavoriteCount = async (req, res) => {
  const { startupId } = req.params;
  try {
    const count = await getFavoriteCountService(startupId);
    return res.status(200).json({ count });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getMyFavorites = async (req, res) => {
  const userId = req.user.userId;
  try {
    const favorites = await getMyFavoritesService(userId);
    return res.status(200).json(favorites);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const addRating = async (req, res) => {
  const userId = req.user.userId;
  const { startupId } = req.params;
  const { score, feedback } = req.body;

  if (!score) {
    return res.status(400).json({ message: "Score (1-10) is required." });
  }

  try {
    const result = await addRatingService(userId, startupId, {
      score,
      feedback,
    });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getStartupRatings = async (req, res) => {
  const { startupId } = req.params;
  try {
    const ratings = await getStartupRatingsService(startupId);
    return res.status(200).json(ratings);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addComment,
  getComments,
  toggleFavorite,
  getFavoriteCount,
  getMyFavorites,
  addRating,
  getStartupRatings,
};
