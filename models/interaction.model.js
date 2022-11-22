const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: {
        values: ['LIKE', 'DISLIKE', 'SAD', 'ANGRY'],
        message:
          'Interaction type must be one of these values (LIKE, DISLIKE, SAD, ANGRY)',
      },
      required: [true, 'Type is required'],
    },
    post: {
      type: mongoose.Types.ObjectId,
      ref: 'Post',
    },
    comment: {
      type: mongoose.Types.ObjectId,
      ref: 'Comment',
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

module.exports = mongoose.model('Interaction', interactionSchema);
