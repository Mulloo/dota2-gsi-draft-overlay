var https = require('follow-redirects').https;

var options = {
  'method': 'POST',
  'hostname': 'api.imprint.gg',
  'path': '/league/teams',
  'headers': {
    'token': '28ccf915-fb81-4b04-9716-8d772d24b5c3', // Ensure this token is valid
    'Content-Type': 'application/json'
  },
  'maxRedirects': 20
};

var req = https.request(options, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    var body = Buffer.concat(chunks).toString();
    console.log(body);
  });

  res.on("error", function (error) {
    console.error(error);
  });
});

var postData = JSON.stringify({ "league_id": 17414 });

req.write(postData);
req.end();