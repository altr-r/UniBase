const http = require("http");
const app = require("./app/app");
const { createConnection } = require("./connectionDB");
const PORT = process.env.PORT;

(async () => {
  try {
    const connection = await createConnection();

    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();
