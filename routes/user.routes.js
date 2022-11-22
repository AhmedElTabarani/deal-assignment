const router = require('express').Router();

const authController = require('../controllers/auth.controller');
const user = require('../controllers/user.controller');

router.route('/login').post(authController.login);
router.route('/signup').post(authController.signup);

router
  .route('/')
  .get(
    authController.verification,
    authController.restrictTo('ADMIN'),
    user.getAll
  );

module.exports = router;
