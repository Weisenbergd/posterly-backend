import expressAsyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import AppError from "../util/AppError.js";
import bcrypt from "bcrypt";

const getLogin = (req, res, next) => {
  res.send("get login");
};

const signout = (req, res, next) => {
  res.cookie("token", "");
  console.log("signout");
  res.send("sign out route");
};

const postLogin = expressAsyncHandler(async (req, res, next) => {
  const { username, password } = req.body;
  if (!username) return next(new AppError(400, "please insert a username"));
  if (!password) return next(new AppError(400, "please insert a password"));
  const user = await User.findOne({ username });
  if (!user)
    return next(new AppError(404, "a user with this username does not exist"));
  const passwordCheck = await bcrypt.compare(password, user.password);
  if (!passwordCheck)
    return next(new AppError(403, "this password is incorrect"));
  const token = jwt.sign(user.username, process.env.SECRET);
  res.cookie("token", token);
  res.status(200).json({
    message: "login successful",
    user,
  });
});

const getSignUp = (req, res, next) => {
  res.send("get login");
};

const postSignUp = expressAsyncHandler(async (req, res, next) => {
  const { username, password, passwordConfirm } = req.body;
  if (!passwordConfirm)
    return next(new AppError(400, "please confirm password"));
  if (passwordConfirm != password)
    return next(new AppError(400, "the passwords do not match"));
  const user = await User.create({ username, password });
  const token = jwt.sign(user.username, process.env.SECRET);
  res.cookie("token", token);
  res.status(201).json({ status: "user created", user });
});

const getUser = (req, res, next) => {
  res.send("get specific user");
};

const loggedIn = expressAsyncHandler(async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.json(false);
  const verified = await jwt.verify(token, process.env.SECRET);
  const user = await User.findOne({ username: verified });

  res.json({ loggedIn: true, user });
});

export {
  getLogin,
  postLogin,
  getUser,
  getSignUp,
  postSignUp,
  loggedIn,
  signout,
};
