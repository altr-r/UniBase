const express = require("express");
const routes = require("../routes");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  req.time = new Date(Date.now()).toString();
  console.log(req.method, req.hostname, req.path, req.time);
  next();
});

app.use("/api/v1", routes);

module.exports = app;
