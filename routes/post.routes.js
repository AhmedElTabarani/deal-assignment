const router = require('express').Router();

const authController = require('../controllers/auth.controller');
const post = require('../controllers/post.controller');

/**
 * @swagger
 * /api/posts:
 *  post:
 *    summary: create a post (ONLY User)
 *    tags: [Posts]
 *    parameters:
 *       - name: authorization
 *         in: header
 *         description: user token
 *         required: true
 *         type: string
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              title:
 *                type: string
 *                description: The title of the post.
 *              body:
 *                type: string
 *                description: The content of the post.
 *    responses:
 *      201:
 *        description: success to create a post.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/post'
 *      403:
 *        description: You are not allow to perform this operation
 */

router
  .route('/')
  .post(
    authController.verification,
    authController.restrictTo('USER'),
    post.create
  );

/**
 * @swagger
 * /api/posts/approve/:id:
 *  patch:
 *    summary: approve a post
 *    tags: [Admin]
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
 *        description: success to approve a post.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/post'
 *      403:
 *        description: You are not allow to perform this operation
 *
 *      404:
 *        description: There is no post with this id
 */

router
  .route('/approve/:id')
  .patch(
    authController.verification,
    authController.restrictTo('ADMIN'),
    post.approveOrReject('APPROVED')
  );

/**
 * @swagger
 * /api/posts/reject/:id:
 *  patch:
 *    summary: reject a post
 *    tags: [Admin]
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
 *        description: success to reject a post.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/post'
 *      403:
 *        description: You are not allow to perform this operation
 *
 *      404:
 *        description: There is no post with this id
 */

router
  .route('/reject/:id')
  .patch(
    authController.verification,
    authController.restrictTo('ADMIN'),
    post.approveOrReject('REJECTED')
  );

/**
 * @swagger
 * /api/posts:
 *  get:
 *    summary: get all posts
 *    tags: [Admin]
 *    parameters:
 *       - name: authorization
 *         in: header
 *         description: user token
 *         required: true
 *         type: string
 *    responses:
 *      200:
 *        description: success to get all posts.
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/post'
 *      403:
 *        description: You are not allow to perform this operation
 */

router.route('/').get(authController.verification, post.getAll);

module.exports = router;
