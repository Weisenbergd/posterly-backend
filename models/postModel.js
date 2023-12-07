import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  author: {
    type: String,
    required: [true, "must be logged in to post"],
  },
  title: {
    type: String,
    required: [true, "please insert a title"],
    maxLength: 40,
  },
  datePublished: Date,
  content: {
    type: String,
    required: [true, "please insert text content"],
    maxLength: [3000, "this post is too long"],
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  dateEdited: {
    type: Date,
    default: null,
  },
  activeTime: {
    type: Date,
  },
  replies: [
    {
      author: {
        type: String,
        required: true,
      },
      content: String,
      createdAt: Date,
      edited: {
        type: Boolean,
        default: false,
      },
      editedAt: Date,
    },
  ],
});

postSchema.methods.updateReplies = async function () {};

postSchema.pre("validate", function (next) {
  !this.datePublished && (this.datePublished = new Date());
  !this.activeTime && (this.activeTime = new Date());
  next();
});

const Post = mongoose.model("Post", postSchema);

export default Post;
