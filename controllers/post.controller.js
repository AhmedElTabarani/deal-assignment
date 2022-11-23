const Post = require('../models/post.model');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/sendResponse');
const AppError = require('../utils/AppError');

class PostController {
  getAll = asyncHandler(async (req, res, next) => {
    const total = (
      await Post.find({
        status: req.user.role === 'USER' ? 'APPROVED' : /.+/,
      })
    ).length;
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 10;
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < total / limit;
    const hasPrevPage = page !== 1;

    const posts = await Post.aggregate([
      {
        $match: {
          status: req.user.role === 'USER' ? 'APPROVED' : /.+/,
        },
      },
      {
        $lookup: {
          from: 'interactions',
          localField: '_id',
          foreignField: 'post',
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
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $sort: { createdBy: -1 },
      },
    ]);

    sendSuccess(posts, 200, res, {
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
    });
  });

  create = asyncHandler(async (req, res, next) => {
    const { title, body } = req.body;
    const createdBy = req.user._id;

    const post = await Post.create({
      title,
      body,
      createdBy,
    });

    sendSuccess(post, 201, res);
  });

  approveOrReject = (status) => {
    return asyncHandler(async (req, res, next) => {
      const id = req.params.id;
      const post = await Post.findByIdAndUpdate(
        id,
        {
          status,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!post)
        return next(
          new AppError('There is no post with this id', 404)
        );

      sendSuccess(post, 200, res);
    });
  };
}

module.exports = new PostController();
