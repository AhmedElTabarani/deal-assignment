const Comment = require('../models/comment.model');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/sendResponse');
const Post = require('../models/post.model');
const AppError = require('../utils/AppError');

class CommentController {
  getAll = asyncHandler(async (req, res, next) => {
    const comments = await Comment.aggregate([
      {
        $lookup: {
          from: 'interactions',
          localField: '_id',
          foreignField: 'comment',
          as: 'interactions',
          pipeline: [
            {
              $group: {
                _id: '$type',
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
      {
        $addFields: {
          interactions: {
            $arrayToObject: {
              $map: {
                input: '$interactions',
                in: {
                  k: '$$this._id',
                  v: '$$this.count',
                },
              },
            },
          },
        },
      },
    ]);

    sendSuccess(comments, 200, res);
  });

  create = asyncHandler(async (req, res, next) => {
    const { body } = req.body;
    const post = req.params.id;
    const createdBy = req.user._id;

    if (!(await Post.findById(post))) {
      return next(new AppError('There is no post with that id', 404));
    }

    const comment = await Comment.create({
      body,
      post,
      createdBy,
    });

    sendSuccess(comment, 201, res);
  });
}

module.exports = new CommentController();
