const { createConnection } = require("../connectionDB");

let database;

const getConnection = async () => {
  if (!database) {
    database = await createConnection();
  }
  return database;
};

const createStartupService = async (userId, data) => {
  const db = await getConnection();
  const {
    name,
    description,
    logo_url,
    founding_date,
    status,
    sector,
    location,
    role,
    tags,
  } = data;

  const [founderCheck] = await db.execute(
    "SELECT 1 FROM Founders WHERE user_id = ?",
    [userId]
  );
  if (founderCheck.length === 0) {
    const error = new Error("Only registered Founders can create a startup.");
    error.status = 403;
    throw error;
  }

  const [startupResult] = await db.execute(
    `INSERT INTO Startups (name, description, logo_url, founding_date, status, sector, location) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      description,
      logo_url,
      founding_date,
      status || "Active",
      sector,
      location,
    ]
  );
  const startupId = startupResult.insertId;

  await db.execute(
    `INSERT INTO Creates (founder_id, startup_id, role, joined_date) 
     VALUES (?, ?, ?, ?)`,
    [userId, startupId, role || "Founder", founding_date || new Date()]
  );

  if (tags && Array.isArray(tags)) {
    for (const tagName of tags) {
      await db.execute("INSERT IGNORE INTO Tags (name) VALUES (?)", [tagName]);

      const [tagResult] = await db.execute(
        "SELECT tag_id FROM Tags WHERE name = ?",
        [tagName]
      );

      if (tagResult.length > 0) {
        await db.execute(
          "INSERT IGNORE INTO Has_Tag (startup_id, tag_id) VALUES (?, ?)",
          [startupId, tagResult[0].tag_id]
        );
      }
    }
  }

  return { message: "Startup created successfully", startupId };
};

const getAllStartupsService = async (filters) => {
  const db = await getConnection();
  let query = "SELECT * FROM Startups WHERE 1=1";
  const params = [];

  if (filters.sector) {
    query += " AND sector = ?";
    params.push(filters.sector);
  }
  if (filters.name) {
    query += " AND name LIKE ?";
    params.push(`%${filters.name}%`);
  }
  if (filters.status) {
    query += " AND status = ?";
    params.push(filters.status);
  }

  const [rows] = await db.execute(query, params);
  return rows;
};

const getStartupByIdService = async (startupId) => {
  const db = await getConnection();

  const [startups] = await db.execute(
    "SELECT * FROM Startups WHERE startup_id = ?",
    [startupId]
  );
  if (startups.length === 0) {
    const error = new Error("Startup not found");
    error.status = 404;
    throw error;
  }
  const startup = startups[0];

  const [tags] = await db.execute(
    `SELECT t.name FROM Tags t 
     JOIN Has_Tag ht ON t.tag_id = ht.tag_id 
     WHERE ht.startup_id = ?`,
    [startupId]
  );

  const [founders] = await db.execute(
    `SELECT u.user_id, u.name, u.photo_url, c.role 
     FROM Users u
     JOIN Creates c ON u.user_id = c.founder_id
     WHERE c.startup_id = ?`,
    [startupId]
  );

  return { ...startup, tags: tags.map((t) => t.name), founders };
};

const updateStartupService = async (userId, startupId, data) => {
  const db = await getConnection();

  const [isOwner] = await db.execute(
    "SELECT 1 FROM Creates WHERE founder_id = ? AND startup_id = ?",
    [userId, startupId]
  );
  if (isOwner.length === 0) {
    const error = new Error(
      "Forbidden: You are not a founder of this startup."
    );
    error.status = 403;
    throw error;
  }

  const updates = [];
  const params = [];
  const allowedFields = [
    "name",
    "description",
    "logo_url",
    "status",
    "sector",
    "location",
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(data[field]);
    }
  }

  if (updates.length === 0) return { message: "No changes provided" };

  params.push(startupId);
  await db.execute(
    `UPDATE Startups SET ${updates.join(", ")} WHERE startup_id = ?`,
    params
  );

  return { message: "Startup updated successfully" };
};

const deleteStartupService = async (userId, startupId) => {
  const db = await getConnection();

  const [isOwner] = await db.execute(
    "SELECT 1 FROM Creates WHERE founder_id = ? AND startup_id = ?",
    [userId, startupId]
  );

  if (isOwner.length === 0) {
    const error = new Error(
      "Forbidden: You are not a founder of this startup."
    );
    error.status = 403;
    throw error;
  }

  await db.execute("DELETE FROM Startups WHERE startup_id = ?", [startupId]);

  return { message: "Startup deleted successfully" };
};

module.exports = {
  createStartupService,
  getAllStartupsService,
  getStartupByIdService,
  updateStartupService,
  deleteStartupService,
};
