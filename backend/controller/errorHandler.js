import CustomError from "../utils/CustomError.js";

const devError = (res, error) => {
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    stackTrace: error.stack,
    error: error,
  });
};

const prodError = (res, error) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong!. Please try again later.",
    });
  }
};

const castErrorHandler = (err) => {
  const msg = `Invalid value for ${err.path} : ${err.value}!`;
  return new CustomError(msg, 400);
};

const duplicateKeyErrorHandler = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate value '${value}' for field '${field}'. Please use another value!`;
  return new CustomError(message, 400);
};

const validationErrorHandler = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new CustomError(message, 400);
};
const handleJwtExpiredError = () => {
  return new CustomError("Your token has expired. Please login again!", 403);
};
const handleJwtInvalidError = () =>
  new CustomError("Invalid token. Please login again!", 403);
const handleJwtNotBeforeError = () =>
  new CustomError("Token not active yet. Try again later!", 403);

const globalErrorHandler = (error, req, res, next) => {
  // console.log(error);
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";
  if (process.env.NODE_ENV === "development") {
    devError(res, error);
  } else if (process.env.NODE_ENV === "production") {
    let err = { ...error };
    err.message = error.message;
    err.name = error.name;
    if (err.name === "CastError") err = castErrorHandler(err);
    if (err.name === "ValidationError") err = validationErrorHandler(err);
    if (err.code && err.code === 11000) err = duplicateKeyErrorHandler(err);
    if (err.name === "TokenExpiredError") err = handleJwtExpiredError(err);
    if (err.name === "JsonWebTokenError") err = handleJwtInvalidError();
    if (err.name === "NotBeforeError") err = handleJwtNotBeforeError();
    prodError(res, err);
  }
};

export default globalErrorHandler;
