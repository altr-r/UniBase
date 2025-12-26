const router = require("express").Router();
const authRoutes = require("./auth");
const userRoutes = require("./user");
const startupRoutes = require("./startup");
const fundingRoutes = require("./funding");
const investmentRoutes = require("./investment");

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/startups", startupRoutes);
router.use("/funding-rounds", fundingRoutes);
router.use("/invests", investmentRoutes);

module.exports = router;
