
var http = require("http");
setInterval(function () {
    http.get("http://fpl-discord-bot.herokuapp.com/");
}, 300000) // every 5 minutes (300000)

require('dotenv').config();
var bugsnag = require('@bugsnag/js')
var bugsnagClient = bugsnag(process.env.BUGSNAG_API_KEY)

const path = require('path')
const { CommandoClient } = require('discord.js-commando')
const client = new CommandoClient({
    commandPrefix: process.env.BOT_PREFIX,
    owner: process.env.BOT_OWNER,
    disableEveryone: true
})

client.registry
    .registerDefaultTypes()
    .registerDefaultGroups()
    .registerDefaultCommands({
        help: false, prefix: false, ping: false, eval: false, commandState: false
    })
    .registerGroups([
        ['fpl', 'FPL']
    ])
    .registerCommandsIn(path.join(__dirname, 'commands'))

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

// const Fpl = require('./bot-api');

// client.on('message', message => {
//     if (message.author.bot) return;
//     if (message.content.indexOf(PREFIX) !== 0) return;

//     const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
//     const command = args.shift().toLowerCase();
//     const content = args.join(' ');

//     if(command === "info") {
//         let query = args;
//         if (!query || !query.length) {
//             message.reply("did you forgot to input a player name?");
//             return;
//         }
        
//         Fpl.getPlayerByName(message, query);
//     }
//     else if(command === "fixtures")
//         Fpl.getFixtures(message);
//     else if(command === "deadline")
//         Fpl.getDeadline(message);
//     else if(command === "league"){
//         let leagueId = args[0];
//         if (!leagueId || leagueId === "") {
//             message.reply("did you forgot to input a league id?");
//             return;
//         }
//         Fpl.getLeagueRanks(message, leagueId);
//     }
// }); 

client.login(process.env.BOT_TOKEN);