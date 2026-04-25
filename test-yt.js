const fs = require('fs');
const dotenv = require('dotenv');
const envConfig = dotenv.parse(fs.readFileSync('.env'));
const API_KEY = envConfig.PUBLIC_YOUTUBE_API_KEY;
const CHANNEL_ID = 'UCI9sYIUG13W13rBGSPI_yBQ';
const uploadsPlaylistId = CHANNEL_ID.replace('UC', 'UU');
fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=3&key=${API_KEY}`)
  .then(r => r.json())
  .then(d => console.log(JSON.stringify(d, null, 2)))
  .catch(console.error);
