var steamClientFactory = require('./steamClient.js');

var configsArray = [], config, botArray = [];
var argv = process.argv.slice(2);

if (!argv[0] || !argv[1]) {
  console.log("Parameters not found");
  return;
}

config = {};
config.username = argv[0];
config.password = argv[1];
config.sharedSecret = argv[2] || ''; // OPTIONAL
config.games = argv[3] || '730'; // 730 = CSGO. Example '730,107410' // 107410 correspond a Arma 3.
configsArray.push(config);

for (index = 0; index < configsArray.length; index++) {
  var config = configsArray[index]; 
  var bot = steamClientFactory.buildBot(config);
  bot.doLogin();
  botArray.push(bot);
}

console.log('All ' + botArray.length + ' bots are working.');
