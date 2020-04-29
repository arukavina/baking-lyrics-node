var express = require('express')
var http = require('http');

var router = express.Router()

const upResponse = (req, res) => {
  return res.status(200).send('Server Up!')
}

const getArtists = (callback, resp) => {
  const { filter } = callback.query
  
  const url = filter
    ? `${process.env.API_URL}/api/v1/artists/search/${filter}`
    : `${process.env.API_URL}/api/v1/artists/?page=1&per_page=10`
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
        return resp.status(200).send(parsedData)
      } catch (e) {
        console.error(e.message);
      }
    });
  }).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
    return resp.status(500).send('Error trying to connect to the server')
  });

}

const generateSong = (callback, resp) => {
  const { seed, number_words, artist_id } = callback.query
  if (!seed || !number_words || !artist_id) return resp.status(400).send({error: 'Missing parameter'})
  const url = `${process.env.API_URL}/api/v1/artificial_songs/generate/en/seed/${encodeURI(seed)}/words/${number_words}/artist/${artist_id}/`
  console.log(url);
  return get(url, { seed, number_words, artist_id }, resp)
}

const getGeneratedSong = (callback, resp) => {
  const { artificial_song_id } = callback.query
  if (!artificial_song_id) return resp.status(400).send({error: 'Missing parameter'})
  const url = `${process.env.API_URL}/api/v1/artificial_songs/${artificial_song_id}`
  return get(url, {artificial_song_id}, resp)
}

const get = (url, query, resp) => {

  return http.get(url, (res) => {
    const { statusCode, statusMessage } = res;
    const contentType = res.headers['content-type'];
    
    let error;
    if (statusCode !== 200) {
      error = new Error('Request Failed.\n' +
                        `Status Code: ${statusCode} \n` +
                        `Status Message: ${statusMessage}`);
    } else if (!/^application\/json/.test(contentType)) {
      error = new Error('Invalid content-type.\n' +
                        `Expected application/json but received ${contentType}`);
    }
    if (error) {
      console.error(error.message);
      // consume response data to free up memory
      res.resume();
      return resp.status(statusCode).send(error.statusMessage);
    }

    res.setEncoding('utf8');
    let rawData = '';

    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        return resp.status(200).send(parsedData)
      } catch (e) {
        console.error(e.message);
        return resp.status(statusCode).send(statusMessage);
    }
    });
  }).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
    return resp.status(500).send('Error trying to connect to the server')
  });

}

router.get('/health', upResponse)
router.get('/artists', getArtists)
router.get('/generate', generateSong)
router.get('/generated-song', getGeneratedSong)

module.exports = router