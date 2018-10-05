var express = require('express')
var request = require('request')

var router = express.Router()

const upResponse = function (req, res) {
  return res.status(200).send('Server Up!')
}

router.get('/', upResponse)

module.exports = router
