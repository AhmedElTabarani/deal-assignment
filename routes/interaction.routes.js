const router = require('express').Router();

const authController = require('../controllers/auth.controller');
const interaction = require('../controllers/interaction.controller');

/**
 * @swagger
 * /api/interactions:
 *  get:
 *    summary: get all interactions
 *    tags: [Interactions]
 *    parameters:
 *       - name: authorization
 *         in: header
 *         description: user token
 *         required: true
 *         type: string
 *    responses:
 *      200:
 *        description: success to get all interactions.
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/interaction'
 *      403:
 *        description: You are not allow to perform this operation
 */

router
  .route('/')
  .get(authController.verification, interaction.getAll);

/**
 * @swagger
 * /api/interactions/post/:id:
 *  post:
 *    summary: interact on a post
 *    tags: [Interactions]
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
 *        description: success to interact on a post.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/interaction'
 *      403:
 *        description: You are not allow to perform this operation
 *
 *      404:
 *        description: There is no post with this id
 */

router
  .route('/post/:id')
  .post(authController.verification, interaction.interactOn('post'));

/**
 * @swagger
 * /api/interactions/comment/:id:
 *  post:
 *    summary: interact on a comment
 *    tags: [Interactions]
 *    parameters:
 *       - name: authorization
 *         in: header
 *         description: user token
 *         required: true
 *         type: string
 *       - name: id
 *         in: path
 *         description: id of the comment
 *         required: true
 *         type: string
 *    responses:
 *      200:
 *        description: success to interact on a comment.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/interaction'
 *      403:
 *        description: You are not allow to perform this operation
 *
 *      404:
 *        description: There is no comment with this id
 */

router
  .route('/comment/:id')
  .post(
    authController.verification,
    interaction.interactOn('comment')
  );

module.exports = router;
