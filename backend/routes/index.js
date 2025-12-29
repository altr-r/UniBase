const router = require("express").Router();
const authRoutes = require("./auth");
const userRoutes = require("./user");
const startupRoutes = require("./startup");
const fundingRoutes = require("./funding");
const investmentRoutes = require("./investment");
const communityRoutes = require("./community");
const analyticsRoutes = require("./analytics");

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/startups", startupRoutes);
router.use("/funding-rounds", fundingRoutes);
router.use("/invests", investmentRoutes);
router.use("/community", communityRoutes);
router.use("/analytics", analyticsRoutes);

module.exports = router;
