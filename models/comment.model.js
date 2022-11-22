const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: [true, 'Body content is required'],
    },
    post: {
      type: mongoose.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Comment must have a post'],
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Comment must be created by a user'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('Comment', commentSchema);
