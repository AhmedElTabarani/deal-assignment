const router = require('express').Router();

const authController = require('../controllers/auth.controller');
const comment = require('../controllers/comment.controller');

router.route('/').get(
  authController.verification,
  comment.getAll
);

router
  .route('/:postId')
  .post(authController.verification, comment.create);

module.exports = router;
