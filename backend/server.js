const http = require("http");
const app = require("./app/app");
const connection = require("./connectionDB");
const PORT = process.env.PORT;

connection.connect((err) => {
  if (err) {
    console.log("Database connection failed");
    process.exit(1);
  }

  console.log("Database connected succesfully");
  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
});
