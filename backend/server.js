import dotenv from "dotenv";
import mongoose from "mongoose";

// dotenv.config({
//   path: "./config.env",
//   debug: true,
// });

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
  debug: true,
});

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("Uncaught Exception occured! shutting down....");
  process.exit(1);
});

import app from "./app.js";
import path from "path";

mongoose
  .connect(process.env.CONN_STR)
  .then((conn) => {
    console.log(conn.connection.host);
    console.log("DB connection successfully");
  })
  .catch((err) => {
    console.log(err);
  });

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server start at PORT:${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("Unhandled rejection occured! shutting down....");
  server.close(() => {
    process.exit(1);
  });
});
