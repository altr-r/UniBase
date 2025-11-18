const express = require("express");

const app = express();

app.get("/", (req, res) => {
  return res.json({ message: "success" });
});

module.exports = app;
