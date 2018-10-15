var express = require('express')
var request = require('request')
var http = require('http');

var router = express.Router()

const upResponse = (req, res) => {
  return res.status(200).send('Server Up!')
}

const getArtists = (callback, resp) => {
  const { filter } = callback.query
  const url = filter
    ? `http://ai.bakinglyrics.com:8080/api/v1/artists/search/${filter}`
    : 'http://ai.bakinglyrics.com:8080/api/v1/artists/?page=1&per_page=10'
  return http.get(url, (res) => {

    const { statusCode } = res;
    const contentType = res.headers['content-type'];

    let error;
    if (statusCode === 404) resp.status(404).send('Artist not found')
    if (statusCode !== 200) {
      error = new Error('Request Failed.\n' +
                        `Status Code: ${statusCode}`);
    } else if (!/^application\/json/.test(contentType)) {
      error = new Error('Invalid content-type.\n' +
                        `Expected application/json but received ${contentType}`);
    }
    if (error) {
      console.error(error.message);
      // consume response data to free up memory
      res.resume();
      return;
    }

    res.setEncoding('utf8');
    let rawData = '';

    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        console.log(parsedData);
        return resp.status(200).send(parsedData)
      } catch (e) {
        console.error(e.message);
      }
    });
  }).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
  });

}


router.get('/', upResponse)
router.get('/artists', getArtists)

module.exports = router