const {
  createStartupService,
  getAllStartupsService,
  getStartupByIdService,
  updateStartupService,
  deleteStartupService,
  getMyStartupsService,
  getUniqueSectorsService,
  getAllTagsService
} = require("../service/startup");

const createStartup = async (req, res) => {
  const userId = req.user.userId;
  const data = req.body;

  if (!data.name || !data.sector) {
    return res.status(400).json({ message: "Name and Sector are required" });
  }

  try {
    const result = await createStartupService(userId, data);
    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message });
  }
};

const getAllStartups = async (req, res) => {
  const filters = req.query;
  try {
    const result = await getAllStartupsService(filters);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getStartupById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await getStartupByIdService(id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};

const updateStartup = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const data = req.body;

  try {
    const result = await updateStartupService(userId, id, data);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};

const deleteStartup = async (req, res) => {
    const userId = req.user.userId;
    const { id } = req.params;

    try {
        const result = await deleteStartupService(userId, id);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(err.status || 500).json({ error: err.message });
    }
}

const getMyStartups = async (req, res) => {
  const userId = req.user.userId;
  try {
    const startups = await getMyStartupsService(userId);
    return res.status(200).json(startups);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getSectors = async (req, res) => {
  try {
    const sectors = await getUniqueSectorsService();
    return res.status(200).json(sectors);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getTags = async (req, res) => {
    try {
        const tags = await getAllTagsService();
        res.json(tags);
    } catch (e) { res.status(500).json({error: e.message}); }
};

module.exports = {
  createStartup,
  getAllStartups,
  getStartupById,
  updateStartup,
  deleteStartup,
  getMyStartups,
  getSectors,
  getTags
};