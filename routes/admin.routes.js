const router = require('express').Router();

const authController = require('../controllers/auth.controller');
const admin = require('../controllers/admin.controller');

/**
 * @swagger
 * /api/admin/statistics:
 *  get:
 *    summary: get all statistics
 *    tags: [Admin]
 *    parameters:
 *       - name: authorization
 *         in: header
 *         description: user token
 *         required: true
 *         type: string
 *    responses:
 *      200:
 *        description: success to get all statistics.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/stats'
 *      403:
 *        description: You are not allow to perform this operation
 */

router
  .route('/statistics')
  .get(
    authController.verification,
    authController.restrictTo('ADMIN'),
    admin.getStatistics
  );
module.exports = router;
