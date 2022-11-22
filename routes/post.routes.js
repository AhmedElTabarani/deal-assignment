const router = require('express').Router();

const authController = require('../controllers/auth.controller');
const post = require('../controllers/post.controller');

router
  .route('/')
  .post(
    authController.verification,
    authController.restrictTo('USER'),
    post.create
  );

router
  .route('/approve/:id')
  .patch(
    authController.verification,
    authController.restrictTo('ADMIN'),
    post.approveOrReject('APPROVED')
  );
router
  .route('/reject/:id')
  .patch(
    authController.verification,
    authController.restrictTo('ADMIN'),
    post.approveOrReject('REJECTED')
  );

router.route('/').get(
  authController.verification,
  // authController.restrictTo('ADMIN'),
  post.getAll
);

module.exports = router;
