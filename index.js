require('dotenv').config()
const _ = require('lodash');
const axios = require('axios');
const moment = require('moment');
const fplapi = require('fpl-api-node');


const { Client, RichEmbed } = require('discord.js');
const client = new Client();

const prefix = process.env.BOT_PREFIX;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
    if (message.author.bot) return;
    if (message.content.indexOf(prefix) !== 0) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const content = args.join(' ');

    if(command === "info") {
        let name = content;
        if(!content ||content === "")
            message.reply("did you forgot to input a player name?");

        if(content === "") return;
        
        getPlayerByName(message, content);
    }

    if(command === "fixtures"){
        getFixtures(message);
    }

    if(command === "deadline"){
        getDeadline(message);
    }
}); 

client.login(process.env.BOT_TOKEN);

function getPlayerByName(message, name){
    fplapi.getElements().then((players) => {
        let player = _.filter(players, function (player) {
            return (player.first_name + player.second_name).toLowerCase().indexOf(name.toLowerCase()) > -1;
        });

        if (player.length === 0) {
            message.reply("I couldn't find this player, is his name spelled correctly?");
            return;
        }

        console.log(player);
        player = player[0];

        fplapi.getElementTypes().then((positions) => {
            let position = _.filter(positions, function (position) {
                return position.id === player.element_type;
            });

            position = position[0];

            const embed = new RichEmbed()
                .setTitle(player.first_name + ' ' + player.second_name)
                .setThumbnail(`http://platform-static-files.s3.amazonaws.com/premierleague/photos/players/250x250/p${player.code}.png`)
                .setColor(65415)
                .addField('----------------------', 
                        `**Injury :** ${player.news}\n`+
                        `**Price :** ${player.now_cost / 10}m\n`+
                        `**Position :** ${position.singular_name_short}\n` +
                        `**Selected :** ${player.selected_by_percent}%\n` +
                        `**Influence :** ${player.influence}\n` +
                        `**Creativity :** ${player.creativity}\n` +
                        `**Threat :** ${player.threat}\n` +
                        `**Form :** ${player.form}\n` +
                        `**EA Index :** ${player.ea_index}\n` +
                        `**Avg Points Per Game :** ${player.points_per_game}\n` +
                        `**Transfer this GW :** ${player.transfers_in_event - player.transfers_out_event}\n`)
                .setFooter('fantasy.premierleague.com', 'https://fantasy.premierleague.com/static/libsass/plfpl/dist/img/facebook-share.png');

            message.channel.send(embed);
        });
    });
}

function getFixtures(message){
    fplapi.getEvents().then((weeks) => {
        let week = _.filter(weeks, function(week){
            return (week.is_current && !week.finished) || week.is_next;
        })[0];
        
        fplapi.getTeams().then((teamList) => {
            let teams = teamList;

            axios.get(`https://fantasy.premierleague.com/drf/event/${week.id}/live`).then((response) => {
                let fixtures = response.data.fixtures;

                const embed = new RichEmbed()
                    .setTitle(`Game Week ${week.id}`)
                    .setColor(65415)
                    .setFooter('fantasy.premierleague.com', 'https://fantasy.premierleague.com/static/libsass/plfpl/dist/img/facebook-share.png');
                var gameStr = '';

                var offset = moment(message.createdAt).utcOffset() - moment(week.deadline_time).utcOffset();

                fixtures.forEach((fixture) => {
                    var matchedTeams = {};
                    for (var i = 0; i < teams.length; i++) {
                        if (teams[i].id === fixture.team_h)
                            matchedTeams.home = teams[i].short_name;
                        else if (teams[i].id === fixture.team_a)
                            matchedTeams.away = teams[i].short_name;

                        if (matchedTeams.away && matchedTeams.home)
                            break;
                    }
                    console.log(matchedTeams);
                    gameStr += `**${matchedTeams.home}** vs **${matchedTeams.away}**\n${moment(fixture.kickoff_time).add(offset,'minutes').format('hh:mm A DD MMM YYYY')}\n\n`;
                });

                embed.addField('----------------------', gameStr);
                message.channel.send(embed);
            }).catch((error) => {
                console.log(error);
                message.reply("something occurred. Please try again later.");
            });
        });
    });
}

function getDeadline(message){

    fplapi.getEvents().then((weeks) => {
        let week = _.filter(weeks, function (week) {
            return (week.is_current && !week.finished) || week.is_next;
        })[0];

        var deadline = moment(week.deadline_time);
        var offset = moment(message.createdAt).utcOffset() - deadline.utcOffset();

        message.channel.send(`Game Week ${week.id} Deadline: ${deadline.add(offset, 'minutes').format('h:mm A DD MMM YYYY')}`);
    });
}