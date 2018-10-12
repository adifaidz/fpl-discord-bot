require('dotenv').config();
const Fpl = require('./bot-api');
const { RichEmbed, Client } = require('discord.js');


//Ping
var http = require("http");
setInterval(function () {
    http.get("http://fpl-discord-bot.herokuapp.com/");
}, 300000); // every 5 minutes (300000)

// Discord Bot
const client = new Client();
const PREFIX = process.env.BOT_PREFIX;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
    if (message.author.bot) return;
    if (message.content.indexOf(PREFIX) !== 0) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const content = args.join(' ');

    if(command === "info") {
        let query = args;
        if (!query || !query.length) {
            message.reply("did you forgot to input a player name?");
            return;
        }
        
        Fpl.getPlayerByName(message, query);
    }
    else if(command === "fixtures")
        Fpl.getFixtures(message);
    else if(command === "deadline")
        Fpl.getDeadline(message);
    else if(command === "league"){
        let leagueId = args[0];
        if (!leagueId || leagueId === "") {
            message.reply("did you forgot to input a league id?");
            return;
        }
        Fpl.getLeagueRanks(message, leagueId);
    }
    else if(command === "help"){
        const embed = new RichEmbed()
            .setTitle('List of commands')
            .setColor(65415)
            .setThumbnail(`https://fantasy.premierleague.com/static/libsass/plfpl/dist/img/facebook-share.png`)
            .addField('----------------------',
                `**${PREFIX}info [name]**\n`+
                'Get player info by name\n\n' +
                `**${PREFIX}fixtures**\n` +
                'Get the latest fixtures in GMT+8 time\n\n' +
                `**${PREFIX}deadline**\n` +
                'Get the current week deadline\n\n' +
                `**${PREFIX}league [league ID]**\n` +
                'Get league standings by id\n\n' +
                '***Report any issues at [Github](https://github.com/adifaidz/fpl-discord-bot)***')
            .setFooter('fantasy.premierleague.com', 'https://fantasy.premierleague.com/static/libsass/plfpl/dist/img/facebook-share.png');
        message.channel.send(embed);
    }
}); 

client.login(process.env.BOT_TOKEN);