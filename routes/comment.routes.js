const router = require('express').Router();

const authController = require('../controllers/auth.controller');
const comment = require('../controllers/comment.controller');

/**
 * @swagger
 * /api/comments:
 *  get:
 *    summary: get all comments
 *    tags: [Comments]
 *    parameters:
 *       - name: authorization
 *         in: header
 *         description: user token
 *         required: true
 *         type: string
 *    responses:
 *      200:
 *        description: success to get all comments.
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/comment'
 *      403:
 *        description: You are not allow to perform this operation
 */

router.route('/').get(
  authController.verification,
  comment.getAll
);

/**
 * @swagger
 * /api/comments/:id:
 *  post:
 *    summary: comment on a post
 *    tags: [Comments]
 *    parameters:
 *       - name: authorization
 *         in: header
 *         description: user token
 *         required: true
 *         type: string
 *       - name: id
 *         in: path
 *         description: id of the post
 *         required: true
 *         type: string
 *    responses:
 *      200:
 *        description: success to comment on a post.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/comments'
 *      403:
 *        description: You are not allow to perform this operation
 *
 *      404:
 *        description: There is no post with this id
 */

router
  .route('/:id')
  .post(authController.verification, comment.create);

module.exports = router;
