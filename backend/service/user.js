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

      f.user_id as is_founder,
      m.user_id as is_mentor,

      i.type as investor_type,
      i.website as investor_website,
      i.location as investor_location

    FROM users u
    LEFT JOIN founders f ON u.user_id = f.user_id
    LEFT JOIN mentors m ON u.user_id = m.user_id
    LEFT JOIN investors i ON u.user_id = i.user_id
    WHERE u.user_id = ?
  `;

  const [rows] = await db.execute(userQuery, [userId]);

  if (rows.length === 0) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  const user = rows[0];

  let role = "general_user";

  if (user.is_founder) {
    role = "founder";
  } else if (user.investor_type) {
    role = "investor";
  } else if (user.is_mentor) {
    role = "mentor";
  }

  let phones = [];
  let expertise = [];

  if (role === "founder") {
    const [phoneRows] = await db.execute(
      "SELECT phone FROM founder_phones WHERE user_id = ?",
      [userId]
    );

    phones = phoneRows.map((row) => row.phone);
  }

  if (role === "mentor") {
    const [expRows] = await db.execute(
      "SELECT expertise FROM mentor_expertise WHERE user_id = ?",
      [userId]
    );
    expertise = expRows.map((row) => row.expertise);
  }

  return {
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    role: role,
    profile: {
      bio: user.bio,
      photo_url: user.photo_url,

      ...(role === "founder" && { phones: phones }),

      ...(role === "investor" && {
        type: user.investor_type,
        website: user.investor_website,
        location: user.investor_location,
      }),

      ...(role === "mentor" && { expertise: expertise }),
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

module.exports = { getUserProfileService, updateUserProfileService };
