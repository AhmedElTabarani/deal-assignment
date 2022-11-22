const router = require('express').Router();

const authController = require('../controllers/auth.controller');
const admin = require('../controllers/admin.controller');

router
  .route('/statistics')
  .get(
    authController.verification,
    authController.restrictTo('ADMIN'),
    admin.getStatistics
  );
module.exports = router;
