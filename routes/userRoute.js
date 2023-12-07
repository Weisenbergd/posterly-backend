import express from "express";
import {
  getLogin,
  postLogin,
  getUser,
  loggedIn,
  signout,
} from "../controller/userController.js";

const router = express.Router();

router.route("/").get(getLogin).post(postLogin);

router.get("/signout", signout);

router.get("/loggedIn", loggedIn);

router.route("/:userID").get(getUser);

export default router;
