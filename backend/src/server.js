require('dotenv').config();
const mongoose = require('mongoose');
const { app } = require('./app');

const port = process.env.PORT || 5000;
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/awdf_tasks';

mongoose.connect(uri)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => console.log(`Backend listening on http://localhost:${port}`));
  })
  .catch((error) => {
    console.error('Could not connect to MongoDB:', error.message);
    console.error('Check MONGODB_URI or start MongoDB. Server was not started.');
    process.exit(1);
  });
