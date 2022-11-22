const app = require('./app');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3000;

module.exports = mongoose
  .connect(
    process.env.NODE_ENV === 'test'
      ? process.env.MONGODB_TEST_URL
      : process.env.MONGODB_URL
  )
  .then(() => {
    console.log('> Connected to Mongodb server successfully');

    return app.listen(PORT, () => {
      console.log(`> Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
