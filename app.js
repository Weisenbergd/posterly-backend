import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import mainRoute from "./routes/mainRoute.js";
import userRoute from "./routes/userRoute.js";
import postRoute from "./routes/postRoute.js";
import AppError from "./util/AppError.js";
import errorHandler from "./controller/errorController.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import compression from "compression";

const app = express();
dotenv.config();

// Middleware
// Set Security HTTP Headers
app.use(helmet());

// Limit Requests
const limiter = rateLimit({
  max: 500,
  windowMs: 60 * 20 * 1000,
  message: "Too many requests from this IP, please try again in an hour",
});
app.use(limiter);

app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Data Sanitization against NoSQL query injection
app.use(ExpressMongoSanitize());

// Data Sanitization against XSS

// Prevent parameter pollution
app.use(hpp());

app.use(compression());

// Routes
app.use("/", mainRoute);
app.use("/user", userRoute);
app.use("/post", postRoute);
app.use("*", (req, res, next) => {
  res.send(new AppError(404, "this page does not exist"));
});

app.use(errorHandler);

mongoose
  .connect(process.env.DB)
  .then(() => console.log("connected to db"))
  .then(() => app.listen(process.env.PORT || 3000))
  .then(() => console.log("now listening..."));
