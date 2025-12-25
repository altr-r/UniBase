const router = require("express").Router();
const authRoutes = require("./auth");
const userRoutes = require("./user");
const startupRoutes = require("./startup");

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/startups", startupRoutes);

module.exports = router;
