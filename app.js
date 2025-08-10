
import express from "express";
import mongoose from "mongoose";

// Local imports
import config from "./utils/config.js";
import middleware from "./utils/middleware.js";
import logger from "./utils/logger.js";
import blogsRouter from "./controllers/bloglist.js";

const app = express();

logger.info("connecting to", config.MONGODB_URI);
mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .catch((error) => {
    logger.error("error connection to MongoDB:", error.message);
  });



app.use(express.json());
app.use(middleware.requestLogger);
app.use(express.static("dist"));
app.use("/api/blogs", blogsRouter);
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

export default app;
