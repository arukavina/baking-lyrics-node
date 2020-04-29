var express = require('express')
const fetch = require('node-fetch')

var router = express.Router()

const upResponse = (req, res) => {
  return res.status(200).send('Server Up!')
}

const getArtists = (callback, resp) => {
  const { filter } = callback.query
  const url = filter
    ? `${process.env.API_URL}/api/v1/artists/search/${filter}`
    : `${process.env.API_URL}/api/v1/artists/?per_page=20`
  return get(url, resp)
}

const generateSong = (callback, resp) => {
  const { seed, number_words, artist_id } = callback.query
  if (!seed || !number_words || !artist_id) return resp.status(400).send({error: 'Missing parameter'})
  const url = `${process.env.API_URL}/api/v1/artificial_songs/generate/en/seed/${encodeURI(seed)}/words/${number_words}/artist/${artist_id}/`
  return get(url, resp)
}

const getGeneratedSong = (callback, resp) => {
  const { artificial_song_id } = callback.query
  if (!artificial_song_id) return resp.status(400).send({error: 'Missing parameter'})
  const url = `${process.env.API_URL}/api/v1/artificial_songs/${artificial_song_id}`
  return get(url, resp)
}

const get = (url, resp) => fetch(url)
    .then(res => res.json())
    .then(json => resp.status(200).send(json))
    .catch(e => {
      console.error(`Got error: ${e.message}`);
      return resp.status(500).send('Error trying to connect to the server')
    })

router.get('/health', upResponse)
router.get('/artists', getArtists)
router.get('/generate', generateSong)
router.get('/generated-song', getGeneratedSong)

module.exports = router