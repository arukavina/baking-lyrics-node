var express = require('express')
var config = require('./env')
const port = config.PORT
var app = express();
var router = require('./routes')

app.use('/', router)

app.listen(port, function () {
  console.log('Server Dinamic listening on port:', port)
});
