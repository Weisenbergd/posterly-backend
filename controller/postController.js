import asyncHandler from "express-async-handler";
import Post from "../models/postModel.js";
import AppError from "../util/AppError.js";
import jwt from "jsonwebtoken";
import checkAuth from "../util/checkAuth.js";
import User from "../models/userModel.js";

const getPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find().sort({ activeTime: -1 });

  res.json({
    posts,
  });
});

const getSinglePost = asyncHandler(async (req, res, next) => {
  const _id = req.params.postID;

  const post = await Post.findOne({ _id });

  if (!post) return next(new AppError(404, "this post does not exist"));

  res.json({
    post,
  });
});

const postPost = asyncHandler(async (req, res, next) => {
  const { title, content } = req.body;

  const posts = await Post.find().sort({ activeTime: 1 });
  let lastPost;
  if (posts.length >= 15) {
    lastPost = posts[posts.length - 1];
    for (const [i, post] of posts.entries()) {
      if (posts.length >= 15) {
        await Post.findByIdAndDelete(post._id);
        posts.pop();
      } else break;
    }
  }

  const newPost = await Post.create({
    title,
    content,
    author: jwt.verify(req.cookies.token, process.env.SECRET),
  });
  res.json({
    newPost,
  });
});

const edit = asyncHandler(async (req, res, next) => {
  const { _id, target, replyID, content } = req.body;
  const post = await Post.findOne({ _id });

  if (target === "post") {
    if (!post) return next(new AppError(404, "this post does not exist"));
    if (!checkAuth(post.author, req.cookies.token)) {
      return res.status(403).json({
        message: "you are not authorized to edit this post, please log in",
      });
    }

    post.content = content;
    post.isEdited = true;
    post.dateEdited = new Date();
    post.activeTime = new Date();
    await post.save();

    res.json({
      post,
    });
  } else if (target === "reply") {
    if (!post) return next(new AppError(404, "this reply does not exist"));
    let foundReply;
    for (const reply of post.replies) {
      if (reply.id === replyID) {
        foundReply = reply;
        foundReply.content = content;
        await post.save();
      }
    }

    if (!checkAuth(foundReply.author, req.cookies.token)) {
      return next(
        new AppError(
          403,
          "you do not have access to edit this reply, please log in"
        )
      );
    }

    if (foundReply) {
      return res.status(201).json({
        message: "reply updated",
      });
    }
    res.json({
      message: "couldnt find that reply",
    });
  }
});

const deletePost = asyncHandler(async (req, res, next) => {
  const { postID: _id } = req.params;
  const username = jwt.verify(req.cookies.token, process.env.SECRET);
  const verifiedUser = await User.findOne({ username });
  if (!verifiedUser) return next(new AppError(404, "this user does not exist"));
  const post = await Post.findOneAndDelete({
    author: verifiedUser.username,
    _id,
  });
  if (!post) {
    return next(
      new AppError(403, "you do not have access to delete this post")
    );
  }
  res.json({
    status: "success",
    message: "post deleted",
    post,
  });
});

const postReply = asyncHandler(async (req, res, next) => {
  const { reply } = req.body;
  const { postID: _id } = req.params;
  if (!reply) return next(new AppError(401, "please insert content"));
  if (!reply)
    return next(new AppError(400, "you can't send a reply from here"));
  const post = await Post.findOne({ _id });
  if (post.replies.length >= 150)
    return next(new AppError(400, "thread full, cannot exceed 300 replies"));
  post.activeTime = new Date();
  post.replies.push({
    content: reply,
    createdAt: new Date(),
    author: jwt.verify(req.cookies.token, process.env.SECRET),
  });

  await post.save();
  res.status(200).json({
    status: "success",
    message: "reply posted",
    reply,
  });
});

const deleteReply = asyncHandler(async (req, res, next) => {
  const { postID, replyID } = req.params;
  const username = jwt.verify(req.cookies.token, process.env.SECRET);
  const verifiedUser = await User.findOne({ username });
  if (!verifiedUser) return next(new AppError(404, "this user does not exist"));

  if (!username)
    return next(
      new AppError(403, "you must be logged in to delete or edit a reply")
    );

  const post = await Post.findOne({ _id: postID });

  let position;
  let reply;
  for (const [i, x] of post.replies.entries()) {
    if (x._id.toString() === replyID) {
      position = i;
      reply = x;
      break;
    }
  }
  if (reply.author != username)
    return next(
      new AppError(
        403,
        "you do not have permission to edit or delete this reply"
      )
    );
  post.replies.splice(position, 1);
  await post.save();
  return res.status(200).json({
    status: "success",
    message: "reply deleted",
  });
});

const editReply = asyncHandler(async (req, res, next) => {
  const { user, type, content } = req.body;
  const { postID, replyID } = req.params;

  if (!user)
    return next(
      new AppError(403, "you must be logged in to delete or edit a reply")
    );

  const post = await Post.findOne({ _id: postID });

  let position;
  let reply;
  for (const [i, x] of post.replies.entries()) {
    if (x._id.toString() === replyID) {
      position = i;
      reply = x;
      break;
    }
  }

  if (reply.author != user)
    return next(
      new AppError(
        403,
        "you do not have permission to edit or delete this reply"
      )
    );

  if (!content)
    return next(new AppError(400, "there must be content in updated reply"));
  post.replies[position].content = content;
  await post.save();
  return res.status(200).json({
    status: "sucess",
    message: "post updated",
  });
});

export {
  postPost,
  getSinglePost,
  getPosts,
  edit,
  deletePost,
  postReply,
  deleteReply,
  editReply,
};
