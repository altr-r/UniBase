const { createConnection } = require("../connectionDB");
const { getUserProfileService } = require("../service/user");

const getUserProfile = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await getUserProfileService(userId);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return res.status(err.status || 500).json({ error: err.message });
  }
};

module.exports = { getUserProfile };
