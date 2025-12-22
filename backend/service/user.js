const { createConnection } = require("../connectionDB");

const getUserProfileService = async (userId) => {
  const db = await createConnection();

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

module.exports = { getUserProfileService };
