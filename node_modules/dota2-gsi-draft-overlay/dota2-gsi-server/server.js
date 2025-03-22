const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

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

app.listen(port, () => {
    console.log(`GSI Server is running on port ${port}`);
});
