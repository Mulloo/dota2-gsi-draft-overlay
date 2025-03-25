const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

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

  // Simulate fetching data from an external API
  const heroStatistics = {
    hero_statistics: {
      heroes: [
        { name: 'tinker', winrate: 50 },
        { name: 'sven', winrate: 55 },
        // Add more hero data as needed
      ]
    }
  };

  // Save data to a JSON file
  const filePath = path.join(__dirname, 'heroStatistics.json');
  fs.writeFileSync(filePath, JSON.stringify(heroStatistics, null, 2));

  res.json(heroStatistics);
});

app.listen(port, () => {
    console.log(`GSI Server is running on port ${port}`);
});
