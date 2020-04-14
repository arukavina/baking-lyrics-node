var express = require('express');
var config = require('./env');
const port = config.PORT;
var app = express();
var router = require('./routes');
const dotenv = require('dotenv');
dotenv.config();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/', router);

app.listen(port, function () {
  console.log('Server Dinamic listening on port:', port);
});
