import express from "express";
import qs from "qs";
import morgan from "morgan";
import cookiesPrser from "cookie-parser";
import cors from "cors";
import globalErrorHandler from "./controller/errorHandler.js";
import CustomError from "./utils/CustomError.js";
import productRouter from "./routes/productRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import authRouter from "./routes/authRoute.js";
import discountRouter from "./routes/discountRoute.js";
import couponRouter from "./routes/couponRoute.js";
const app = express();
import path from "path";

const allowedOrigins = ["http://localhost:5173", "http://localhost:5174","https://ecommerce-1-eumb.onrender.com"];
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const __dirname = path.resolve();
app.set("query parser", (str) => qs.parse(str));

app.use(cookiesPrser());

app.use(morgan("dev"));

app.use((req, res, next) => {
  req.requestedAt = new Date().toISOString();
  next();
});
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/discount", discountRouter);
app.use("/api/v1/coupon", couponRouter);
app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get(/^\/(?!api).*/, (_, res) => {
  res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});
app.use((req, res, next) => {
  const err = new CustomError(
    `Can't find ${req.originalUrl} on the server`,
    404
  );
  next(err);
});
app.use(globalErrorHandler);

export default app;
