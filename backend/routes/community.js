const router = require("express").Router();
const {
  addComment,
  getComments,
  toggleFavorite,
  getFavoriteCount,
  getMyFavorites,
  addRating,
  getStartupRatings,
} = require("../controller/community");
const authenticateToken = require("../middleware/auth");

router.get("/me/favorites", authenticateToken, getMyFavorites);

router.get("/:startupId/rates", getStartupRatings);
router.post("/:startupId/rates", authenticateToken, addRating);

router.get("/:startupId/favorites", getFavoriteCount);
router.post("/:startupId/favorites", authenticateToken, toggleFavorite);

router.get("/:startupId/comments", getComments);
router.post("/:startupId/comments", authenticateToken, addComment);

module.exports = router;
