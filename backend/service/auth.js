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

const registerService = async ({ name, email, password, bio, photo_url }) => {
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
  await db.execute(
    "INSERT INTO users (name, email, password, bio, photo_url) VALUES (?, ?, ?, ?, ?)",
    [name, email, hash, bio || null, photo_url || null]
  );

  return { message: "User registered successfully" };
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
