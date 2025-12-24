const { createConnection } = require("../connectionDB");

let database;

const getConnection = async () => {
  if (!database) {
    database = await createConnection();
  }
  return database;
};

const getUserProfileService = async (userId) => {
  const db = await getConnection();

  const userQuery = `
    SELECT 
      u.user_id, u.name, u.email, u.bio, u.photo_url, u.join_date,
      
      (SELECT 1 FROM Founders WHERE user_id = u.user_id) as is_founder,
      (SELECT 1 FROM Investors WHERE user_id = u.user_id) as is_investor,
      (SELECT 1 FROM Mentors WHERE user_id = u.user_id) as is_mentor,
      
      i.type as investor_type, 
      i.website as investor_website,
      i.location as investor_location

    FROM Users u
    LEFT JOIN Investors i ON u.user_id = i.user_id
    WHERE u.user_id = ?
  `;

  const [rows] = await db.execute(userQuery, [userId]);

  if (rows.length === 0) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  const user = rows[0];

  let roles = [];

  if (user.is_founder) roles.push("founder");
  if (user.is_investor) roles.push("investor");
  if (user.is_mentor) roles.push("mentor");

  if (roles.length === 0) roles.push("general_user");

  let phones = [];
  let expertise = [];

  if (roles.includes("founder")) {
    const [phoneRows] = await db.execute(
      "SELECT phone FROM Founder_Phones WHERE user_id = ?",
      [userId]
    );
    phones = phoneRows.map((row) => row.phone);
  }

  if (roles.includes("mentor")) {
    const [expRows] = await db.execute(
      "SELECT expertise FROM Mentor_Expertise WHERE user_id = ?",
      [userId]
    );
    expertise = expRows.map((row) => row.expertise);
  }

  return {
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    roles: roles, 
    profile: {
      bio: user.bio,
      photo_url: user.photo_url,

      ...(roles.includes("founder") && { phones: phones }),

      ...(roles.includes("investor") && {
        type: user.investor_type,
        website: user.investor_website,
        location: user.investor_location,
      }),

      ...(roles.includes("mentor") && { expertise: expertise }),
    },
  };
};

const updateUserProfileService = async (userId, data) => {
  const db = await createConnection();
  const { bio, photo_url, phones, expertise, website, location, type } = data;

  const [roles] = await db.execute(
    `
    SELECT 
      (SELECT 1 FROM Founders WHERE user_id = ?) AS is_founder,
      (SELECT 1 FROM Investors WHERE user_id = ?) AS is_investor,
      (SELECT 1 FROM Mentors WHERE user_id = ?) AS is_mentor
  `,
    [userId, userId, userId]
  );

  const userRole = roles[0];

  let userUpdates = [];
  let userParams = [];

  if (bio !== undefined) {
    userUpdates.push("bio = ?");
    userParams.push(bio);
  }
  if (photo_url !== undefined) {
    userUpdates.push("photo_url = ?");
    userParams.push(photo_url);
  }

  if (userUpdates.length > 0) {
    userParams.push(userId);
    await db.execute(
      `UPDATE Users SET ${userUpdates.join(", ")} WHERE user_id = ?`,
      userParams
    );
  }

  if (userRole.is_founder) {
    if (phones && Array.isArray(phones)) {
      await db.execute("DELETE FROM Founder_Phones WHERE user_id = ?", [
        userId,
      ]);
      for (const phone of phones) {
        await db.execute(
          "INSERT INTO Founder_Phones (user_id, phone) VALUES (?, ?)",
          [userId, phone]
        );
      }
    }
  } else if (phones) {
    throw new Error("Forbidden: Only founders can set phone numbers.");
  }

  if (userRole.is_mentor) {
    if (expertise && Array.isArray(expertise)) {
      await db.execute("DELETE FROM Mentor_Expertise WHERE user_id = ?", [
        userId,
      ]);
      for (const skill of expertise) {
        await db.execute(
          "INSERT INTO Mentor_Expertise (user_id, expertise) VALUES (?, ?)",
          [userId, skill]
        );
      }
    }
  } else if (expertise) {
    throw new Error("Forbidden: Only mentors can set expertise.");
  }

  if (userRole.is_investor) {
    let investorUpdates = [];
    let investorParams = [];

    if (website !== undefined) {
      investorUpdates.push("website = ?");
      investorParams.push(website);
    }
    if (location !== undefined) {
      investorUpdates.push("location = ?");
      investorParams.push(location);
    }
    if (type !== undefined) {
      investorUpdates.push("type = ?");
      investorParams.push(type);
    }

    if (investorUpdates.length > 0) {
      investorParams.push(userId);
      await db.execute(
        `UPDATE Investors SET ${investorUpdates.join(", ")} WHERE user_id = ?`,
        investorParams
      );
    }
  } else if (website || location || type) {
    throw new Error("Forbidden: Only investors can update.");
  }

  return { message: "Profile updated successfully" };
};

const addUserRoleService = async (userId, role, data) => {
  const db = await getConnection();

  try {
    if (role === "founder") {
      await db.execute("INSERT IGNORE INTO Founders (user_id) VALUES (?)", [
        userId,
      ]);

      if (data.phones && Array.isArray(data.phones)) {
        for (const phone of data.phones) {
          await db.execute(
            "INSERT IGNORE INTO Founder_Phones (user_id, phone) VALUES (?, ?)",
            [userId, phone]
          );
        }
      }
    } else if (role === "investor") {

      await db.execute(
        `INSERT IGNORE INTO Investors (user_id, type, website, location) 
         VALUES (?, ?, ?, ?)`,
        [userId, data.type || null, data.website || null, data.location || null]
      );
    } else if (role === "mentor") {
      await db.execute("INSERT IGNORE INTO Mentors (user_id) VALUES (?)", [
        userId,
      ]);

      if (data.expertise && Array.isArray(data.expertise)) {
        for (const skill of data.expertise) {
          await db.execute(
            "INSERT IGNORE INTO Mentor_Expertise (user_id, expertise) VALUES (?, ?)",
            [userId, skill]
          );
        }
      }
    }

    return { message: `Role '${role}' added successfully` };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getUserProfileService,
  updateUserProfileService,
  addUserRoleService,
};
