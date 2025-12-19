const mysql = require("mysql2/promise");

const createConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.HOST,
      user: process.env.DB_USER,
      database: process.env.DATABASE,
      password: process.env.PASSWORD,
    });
    console.log("Database connected successfully");
    return connection;
  } catch (err) {
    console.error("Database connection failed:", err);
    throw err;
  }
};

module.exports = { createConnection };
