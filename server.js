const dotenv = require('dotenv');

const mongoose = require('mongoose');

process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log('Unhandled exception: ');
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');
// environment variables
// moongoose configuration

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
  .then(() => console.log('DB connection established'));

// console.log(process.env);

const port = 3000; // process.env.PORT ||
const server = app.listen(port, (req, res) => {
  console.log(`listening on port ${port}`);
});

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('Unhandled rejection: ');
  server.close(() => {
    process.exit(1);
  });
});
