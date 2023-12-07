import AppError from "../util/AppError.js";

const validationError = (err) => {
  return new AppError(400, err);
};

const castError = () => {
  return new AppError(400, "this id does not follow the correct format");
};

const uniqueError = () => {
  return new AppError(400, "a user with this username already exists");
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message.message || err.message,
    });

    // Programming or other unknown error
  } else {
    console.error("ERROR", err);
    res.status(500).json({
      status: "error",
      message: "something went wrong (programming/unknown error)",
    });
  }
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.ENV === "DEV") {
    // console.log(err);
    sendErrorDev(err, res);
  } else {
    if (err.name === "ValidationError") err = validationError(err);
    if (err.name === "CastError") err = castError();
    if (err.code === 11000) err = uniqueError();
    sendErrorProd(err, res);
  }
};

export default errorHandler;
