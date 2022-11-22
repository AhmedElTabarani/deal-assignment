const Interaction = require('../models/interaction.model');
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/sendResponse');
const AppError = require('../utils/AppError');

class InteractionController {
  getAll = asyncHandler(async (req, res, next) => {
    const interactions = await Interaction.find();
    sendSuccess(interactions, 200, res);
  });

  interactOn = (model) => {
    return asyncHandler(async (req, res, next) => {
      const { type } = req.body;
      const createdBy = req.user._id;

      const id = req.params.id;

      if (model === 'post' && !(await Post.findById(id))) {
        return next(
          new AppError('There is no post with that id', 404)
        );
      }

      if (model === 'comment' && !(await Comment.findById(id))) {
        return next(
          new AppError('There is no comment with that id', 404)
        );
      }

      const postOrCommentId = {
        post: undefined,
        comment: undefined,
      };

      if (model === 'post') postOrCommentId.post = id;
      else if (model === 'comment') postOrCommentId.comment = id;

      const interaction = await Interaction.create({
        type,
        ...postOrCommentId,
        createdBy,
      });

      sendSuccess(interaction, 201, res);
    });
  };
}

module.exports = new InteractionController();
