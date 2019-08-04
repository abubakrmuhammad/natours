process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION 💥 Shutting Down...');
  console.error(err.name, err.message);

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
  });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}. 👍`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION 💥 Shutting Down...');
  console.error(err.name, err.message);

  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED! Shutting Down...');

  server.close(() => console.log('💥 Process Terminated!'));
});
