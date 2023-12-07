class AppError extends Error {
  constructor(statusCode, message) {
    super();
    this.message = message || "no error message";
    this.statusCode = statusCode;

    statusCode >= 500
      ? (this.satus = "server error")
      : (this.status = "user error");

    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
