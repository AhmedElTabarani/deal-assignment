const router = require('express').Router();

const authController = require('../controllers/auth.controller');
const interaction = require('../controllers/interaction.controller');

router.route('/').get(
  authController.verification,
  interaction.getAll
);

router
  .route('/post/:id')
  .post(authController.verification, interaction.interactOn('post'));
router
  .route('/comment/:id')
  .post(
    authController.verification,
    interaction.interactOn('comment')
  );

module.exports = router;
