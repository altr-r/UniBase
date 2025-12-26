const router = require("express").Router();
const {
  makeInvestment,
  getInvestorPortfolio,
} = require("../controller/investment");
const authenticateToken = require("../middleware/auth");

router.post("/", authenticateToken, makeInvestment);

router.get("/me", authenticateToken, getInvestorPortfolio);

module.exports = router;
