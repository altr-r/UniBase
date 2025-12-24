const { getUserProfileService, updateUserProfileService, addUserRoleService } = require("../service/user");

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

const updateUserProfile = async (req, res) => {
  const userId = req.user.userId;
  const data = req.body;

  try {
    const result = await updateUserProfileService(userId, data);
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

const addUserRole = async (req, res) => {
  const userId = req.user.userId;
  const { role, ...data } = req.body; // Separate 'role' from the rest of the data

  if (!role || !['founder', 'investor', 'mentor'].includes(role)) {
    return res.status(400).json({ message: "Invalid or missing role" });
  }

  try {
    const result = await addUserRoleService(userId, role, data);
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { getUserProfile, updateUserProfile, addUserRole };
