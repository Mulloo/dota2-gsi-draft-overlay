const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const https = require('follow-redirects').https;

const app = express();
const port = 4000;

app.use(cors());
app.use(bodyParser.json());

let gameState = {};

app.post('/', (req, res) => {
    gameState = req.body;
    res.sendStatus(200);
});

app.get('/gamestate', (req, res) => {
    res.json(gameState);
});

app.post('/league/heroes', (req, res) => {
  const leagueId = req.body.league_id;
  console.log('Received league ID:', leagueId);

  const options = {
    method: 'POST',
    hostname: 'test.api.imprint.gg',
    path: '/league/heroes',
    headers: {
      'token': '28ccf915-fb81-4b04-9716-8d772d24b5c3', // Ensure this token is valid
      'Content-Type': 'application/json'
    },
    maxRedirects: 20
  };

  const apiReq = https.request(options, function (apiRes) {
    let chunks = [];

    apiRes.on("data", function (chunk) {
      chunks.push(chunk);
    });

    apiRes.on("end", function () {
      const body = Buffer.concat(chunks).toString();
      const heroStatistics = JSON.parse(body);

      // Save data to a JSON file
      const filePath = path.join(__dirname, 'heroStatistics.json');
      fs.writeFileSync(filePath, JSON.stringify(heroStatistics, null, 2));

      res.json(heroStatistics);
    });

    apiRes.on("error", function (error) {
      console.error('Error fetching hero statistics:', error);
      res.status(500).json({ error: error.message });
    });
  });

  const postData = JSON.stringify({ "league_id": leagueId });
  apiReq.write(postData);
  apiReq.end();
});

app.listen(port, () => {
    console.log(`GSI Server is running on port ${port}`);
});
