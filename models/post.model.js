const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    body: {
      type: String,
      required: [true, 'Body content is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['APPROVED', 'PENDING', 'REJECTED', 'ANGRY'],
        message:
          'Post status must be one of these values (APPROVED, PENDING, REJECTED)',
      },
      default: 'PENDING',
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Post must be created by a user'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'createdBy',
    select: '-createdAt -updatedAt',
  });

  next();
});

module.exports = mongoose.model('Post', postSchema);
