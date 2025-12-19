const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { createConnection } = require("../connectionDB");

let database;

const getConnection = async () => {
  if (!database) {
    database = await createConnection();
  }
  return database;
};

const registerService = async ({
  name,
  email,
  password,
  bio,
  photo_url,
  role,
  website,
  location,
  investorType,
}) => {
  const db = await getConnection();

  const [existingUsers] = await db.execute(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  if (existingUsers.length > 0) {
    const error = new Error("User already exists");
    error.status = 400;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const [userResult] = await db.execute(
    "INSERT INTO users (name, email, password, bio, photo_url) VALUES (?, ?, ?, ?, ?)",
    [name, email, hash, bio || null, photo_url || null]
  );

  const newUserId = userResult.insertId;

  try {
    if (role === "founder") {
      await db.execute("INSERT INTO founders (user_id) VALUES (?)", [
        newUserId,
      ]);
    } else if (role === "investor") {
      await db.execute(
        "INSERT INTO investors (user_id, type,website, location) VALUES (?, ?, ?, ?)",
        [newUserId, investorType || null, website || null, location || null]
      );
    } else {
      await db.execute("INSERT INTO general_users (user_id) VALUES (?)", [
        newUserId,
      ]);
    }
  } catch (err) {
    await db.execute("DELETE FROM users WHERE user_id = ?", [newUserId]);
    throw new Error("Failed to assign role: " + err.message);
  }

  return { message: `User registered successfully as ${role}` };
};

const loginService = async ({ email, password }) => {
  const db = await getConnection();

  const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  if (users.length === 0) {
    const error = new Error("No User Found");
    error.status = 400;
    throw error;
  }

  const user = users[0];

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  const token = jwt.sign(
    { userId: user.user_id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return {
    token,
    user: {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      photo_url: user.photo_url,
    },
  };
};

module.exports = {
  registerService,
  loginService,
};
