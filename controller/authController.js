import AppError from "../util/AppError.js";

const protect = (req, res, next) => {
  if (!req.cookies.token) {
    return next(new AppError(403, "please log in to perform this action"));
  }
  next();
};

export { protect };
