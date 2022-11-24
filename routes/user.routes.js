const router = require('express').Router();

const authController = require('../controllers/auth.controller');
const user = require('../controllers/user.controller');

/**
 * @swagger
 * /api/users/login:
 *  post:
 *    summary: login a user
 *    tags: [Users]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              email:
 *                type: string
 *                description: The email address of the user.
 *              password:
 *                type: string
 *                description: The password of the user.
 *    responses:
 *      200:
 *        description: success to login a user.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/user'
 *      401:
 *        description: Email or password not correct
 */

router.route('/login').post(authController.login);

/**
 * @swagger
 * /api/users/signup:
 *  post:
 *    summary: signup a user
 *    tags: [Users]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              name:
 *                type: string
 *                description: The nam address of the user.
 *              email:
 *                type: string
 *                description: The email address of the user.
 *              password:
 *                type: string
 *                description: The password of the user.
 *    responses:
 *      201:
 *        description: success to signup a user.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/user'
 *      401:
 *        description: Email or password not correct
 */

router.route('/signup').post(authController.signup);

/**
 * @swagger
 * /api/users:
 *  get:
 *    summary: get all users
 *    tags: [Admin]
 *    parameters:
 *       - name: authorization
 *         in: header
 *         description: user token
 *         required: true
 *         type: string
 *    responses:
 *      200:
 *        description: success to get all users.
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/user'
 *      403:
 *        description: You are not allow to perform this operation
 */

router
  .route('/')
  .get(
    authController.verification,
    authController.restrictTo('ADMIN'),
    user.getAll
  );

module.exports = router;
