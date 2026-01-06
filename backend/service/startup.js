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

  // --- NEW: Add Tag Filtering Logic ---
  // We check if the startup_id exists in the list of startups that have this tag
  if (filters.tags) {
    query += ` AND startup_id IN (
      SELECT ht.startup_id 
      FROM Has_Tag ht 
      JOIN Tags t ON ht.tag_id = t.tag_id 
      WHERE t.name LIKE ?
    )`;
    params.push(`%${filters.tags}%`); // Partial match (e.g., "AI" matches "GenAI")
  }

  const [rows] = await db.execute(query, params);

  // Optional: Fetch tags for each startup to display them on the card
  // (This is a "nice to have" - you can skip if you just want filtering)
  for (let startup of rows) {
    const [tags] = await db.execute(
      `
      SELECT t.name FROM Tags t
      JOIN Has_Tag ht ON t.tag_id = ht.tag_id
      WHERE ht.startup_id = ?
    `,
      [startup.startup_id]
    );
    startup.tags = tags.map((t) => t.name);
  }

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

  if (updates.length > 0) {
    params.push(startupId);
    await db.execute(
      `UPDATE Startups SET ${updates.join(", ")} WHERE startup_id = ?`,
      params
    );
  }

  if (data.tags && Array.isArray(data.tags)) {
    await db.execute("DELETE FROM Has_Tag WHERE startup_id = ?", [startupId]);

    for (const tagName of data.tags) {
      const cleanedTag = tagName.trim();
      if (cleanedTag) {
        await db.execute("INSERT IGNORE INTO Tags (name) VALUES (?)", [
          cleanedTag,
        ]);

        const [tagResult] = await db.execute(
          "SELECT tag_id FROM Tags WHERE name = ?",
          [cleanedTag]
        );

        if (tagResult.length > 0) {
          await db.execute(
            "INSERT IGNORE INTO Has_Tag (startup_id, tag_id) VALUES (?, ?)",
            [startupId, tagResult[0].tag_id]
          );
        }
      }
    }
  }

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

const getMyStartupsService = async (userId) => {
  const db = await getConnection();
  const [rows] = await db.execute(
    `
    SELECT s.* FROM Startups s
    JOIN Creates c ON s.startup_id = c.startup_id
    WHERE c.founder_id = ?
  `,
    [userId]
  );
  return rows;
};

const getUniqueSectorsService = async () => {
  const db = await getConnection();
  // Get all unique, non-empty sectors, sorted alphabetically
  const [rows] = await db.execute(`
    SELECT DISTINCT sector 
    FROM Startups 
    WHERE sector IS NOT NULL AND sector != '' 
    ORDER BY sector ASC
  `);
  // Transform [{sector: 'AI'}, {sector: 'SaaS'}] -> ['AI', 'SaaS']
  return rows.map(row => row.sector);
};

const getAllTagsService = async () => {
  const db = await getConnection();
  // Changed "SELECT name" -> "SELECT DISTINCT name"
  // This guarantees the frontend never gets duplicates
  const [rows] = await db.execute("SELECT DISTINCT name FROM Tags ORDER BY name ASC");
  return rows.map(r => r.name);
};

module.exports = {
  createStartupService,
  getAllStartupsService,
  getStartupByIdService,
  updateStartupService,
  deleteStartupService,
  getMyStartupsService,
  getUniqueSectorsService,
  getAllTagsService
};
