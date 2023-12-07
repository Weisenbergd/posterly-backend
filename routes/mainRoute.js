import express from "express";
import { postPost, getPosts } from "../controller/postController.js";
import { protect } from "../controller/authController.js";
import { getSignUp, postSignUp } from "../controller/userController.js";

const router = express.Router();

router.route("/").get(getPosts).post(protect, postPost);

router.route("/signup").get(getSignUp).post(postSignUp);

export default router;
