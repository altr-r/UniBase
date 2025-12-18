const router = require("express").Router();
const connection = require("../connectionDB");

router.get("/", (req, res) => {
  return res.json({ message: "success" });
});

router.get("/users", (req, res) => {
  connection.query("Select * FROM users", (err, results, fields) => {
    return res.json(results);
  });
});

module.exports = router;
