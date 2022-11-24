const m2s = require('mongoose-to-swagger');
const User = require('../models/user.model');
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const Interaction = require('../models/interaction.model');

module.exports = {
  user: m2s(User),
  post: m2s(Post),
  comment: m2s(Comment),
  interaction: m2s(Interaction),
  Stats: {
    type: 'object',
    properties: {
      totalNumberOfPosts: {
        type: 'number',
      },
      totalNumberOfPendingPosts: {
        type: 'number',
      },
      totalNumberOfApprovedPosts: {
        type: 'number',
      },
      totalNumberOfRejectedPosts: {
        type: 'number',
      },
      totalNumberOfCommentsOnPosts: {
        type: 'number',
      },
      totalNumberOfInteractionsOnPostsAndComments: {
        type: 'number',
      },
      totalNumberOfInteractionsOnPosts: {
        type: 'number',
      },
      totalNumberOfInteractionsOnComments: {
        type: 'number',
      },
    },
  },
};
