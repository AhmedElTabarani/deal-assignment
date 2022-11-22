const Interaction = require('../models/interaction.model');
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/sendResponse');

const getPostStatistics = async () => {
  return Post.aggregate([
    {
      $group: {
        _id: null,
        totalNumberOfPosts: { $sum: 1 },
        totalNumberOfPendingPosts: {
          $sum: {
            $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0],
          },
        },
        totalNumberOfApprovedPosts: {
          $sum: {
            $cond: [{ $eq: ['$status', 'APPROVED'] }, 1, 0],
          },
        },
        totalNumberOfRejectedPosts: {
          $sum: {
            $cond: [{ $eq: ['$status', 'REJECTED'] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]);
};

const getCommentStatistics = async () => {
  return Comment.aggregate([
    {
      $group: {
        _id: null,
        totalNumberOfCommentsOnPosts: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]);
};

const getInteractionStatistics = async () => {
  return Interaction.aggregate([
    {
      $group: {
        _id: null,
        totalNumberOfInteractionsOnPostsAndComments: { $sum: 1 },
        totalNumberOfInteractionsOnPosts: {
          $sum: {
            $cond: [{ $ifNull: ['$post', false] }, 1, 0],
          },
        },
        totalNumberOfInteractionsOnComments: {
          $sum: {
            $cond: [{ $ifNull: ['$comment', false] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]);
};

class AdminController {
  getStatistics = asyncHandler(async (req, res, next) => {
    const postStats = await getPostStatistics();
    const commentStats = await getCommentStatistics();
    const interactionStats = await getInteractionStatistics();

    sendSuccess(
      { ...postStats[0], ...commentStats[0], ...interactionStats[0] },
      200,
      res
    );
  });
}

module.exports = new AdminController();
