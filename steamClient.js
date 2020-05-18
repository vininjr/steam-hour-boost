var SteamUser = require('steam-user');
var SteamTotp = require('steam-totp');
var botFactory = {};

botFactory.buildBot = function (config) {
	var bot = new SteamUser({
		promptSteamGuardCode: false,
		dataDirectory: "./lookout",
		singleSentryfile: false
	});

	bot.username = config.username;
	bot.password = config.password;
	bot.sharedSecret = config.sharedSecret;
	bot.games = config.games;
	bot.messageReceived = {};

	bot.on('loggedOn', function (details) {
		console.log("[" + this.username + "] Connection sucessfull " + bot.steamID.getSteam3RenderedID());
		bot.setPersona(SteamUser.EPersonaState.Online);
		bot.gamesPlayed(this.games);
	});

	bot.on('error', function (e) {
		console.log("[" + this.username + "] " + e);
		setTimeout(function () { bot.doLogin(); }, 30 * 60 * 1000);
	});

	bot.doLogin = function () {
		this.logOn({
			"accountName": this.username,
			"password": this.password
		});
	}

	bot.on('steamGuard', function (domain, callback) {
		if (!this.sharedSecret) {
			var readlineSync = require('readline-sync');
			var authCode = readlineSync.question("[" + this.username + "] " + 'Steam Guard' + (!domain ? ' App' : '') + ' Code: ');
			callback(authCode);
		}
		else {
			var authCode = SteamTotp.generateAuthCode(this.sharedSecret);
			console.log("[" + this.username + "] Authentification code generate: " + authCode);
			callback(authCode);
		}

	});

	bot.on("friendMessage", function (steamID, message) {
		console.log("[" + this.username + "] Message de " + steamID + ": " + message);
		if (!this.messageReceived[steamID]) {
			bot.chatMessage(steamID, "[Message automatique] Logiciel créer par xnooztv pour boost ses heures - http://steamcommunity.com/id/umer2231/");
			this.messageReceived[steamID] = true;
		}
	});


	bot.on('vacBans', function (numBans, appids) {
		if (numBans > 0) {
			console.log("[" + this.username + "] " + numBans + " VAC ban" + (numBans == 1 ? '' : 's') + "." +
				(appids.length == 0 ? '' : " In apps: " + appids.join(', ')));
		}
	});

	bot.on('accountLimitations', function (limited, communityBanned, locked, canInviteFriends) {
		var limitations = [];

		if (limited) {
			limitations.push('LIMITED');
		}

		if (communityBanned) {
			limitations.push('COMMUNITY BANNED');
		}

		if (locked) {
			limitations.push('LOCKED');
		}

		if (limitations.length !== 0) {
			console.log("[" + this.username + "] Limitations: " + limitations.join(', ') + ".");
		}
	});

	return bot;
}

module.exports = botFactory;