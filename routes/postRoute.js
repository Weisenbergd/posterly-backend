import express from "express";
import {
  getSinglePost,
  postReply,
  edit,
  deletePost,
  editReply,
  deleteReply,
} from "../controller/postController.js";
import { protect } from "../controller/authController.js";

const router = express.Router();

router
  .route("/:postID")
  .get(getSinglePost)
  .post(protect, postReply)
  .patch(protect, edit)
  .delete(protect, deletePost);

router
  .route("/:postID/:replyID")
  .delete(protect, deleteReply)
  .patch(protect, editReply);

export default router;
