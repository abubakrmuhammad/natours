process.on('uncaughtException', err => {
  console.error(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION 💥 Shutting Down...');

  process.exit(1);
});

const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('Connected to DB. 🚀');
  })
  .catch(error => {
    console.log(error);
  });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}. 👍`);
});

process.on('unhandledRejection', err => {
  console.error(err.name, err.message);
  console.log('UNHANDLED REJECTION 💥 Shutting Down...');

  server.close(() => process.exit(1));
});
