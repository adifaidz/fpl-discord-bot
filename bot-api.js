const _ = require('lodash');
const axios = require('axios');
const moment = require('moment-timezone');
const accents = require('remove-accents');

const fplapi = require('fpl-api-node');
const { RichEmbed } = require('discord.js');

const TIMEZONE = process.env.BOT_TIMEZONE;

function getPlayerByName(message, query) {
    let queryRegex = new RegExp("(?=.*" + query.join(")(?=.*") +").*");
    fplapi.getElements().then((players) => {
        let player = _.filter(players, function (player) {
            let player_name = accents.remove((player.first_name  + ' ' + player.second_name));
            return player_name.toLowerCase().match(queryRegex);
        });
        
        if (player.length === 0) {
            message.reply("I couldn't find this player, is his name spelled correctly?");
            return;
        }

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
                    `**Injury :** ${player.news}\n` +
                    `**Price :** ${player.now_cost / 10}m\n` +
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

function getFixtures(message) {
    fplapi.getEvents().then((weeks) => {
        let week = _.filter(weeks, function (week) {
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
                    gameStr += `**${matchedTeams.home}** vs **${matchedTeams.away}**\n${moment(fixture.kickoff_time).tz(TIMEZONE).format('hh:mm A DD MMM YYYY')}\n\n`;
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

function getDeadline(message) {

    fplapi.getEvents().then((weeks) => {
        let week = _.filter(weeks, function (week) {
            return (week.is_current && !week.finished) || week.is_next;
        })[0];

        message.channel.send(`Game Week ${week.id} Deadline: ${moment(week.deadline_time).tz(TIMEZONE).format('h:mm A DD MMM YYYY')}`);
    });
}

function getLeagueRanks(message, leagueId, page = 1) {
    dashIndex = leagueId.indexOf('-');
    if (dashIndex > -1)
        leagueId = leagueId.substr(dashIndex + 1);

    axios.get(`https://fantasy.premierleague.com/drf/leagues-classic-standings/${leagueId}?page=${page}`).then((response) => {
        let league = response.data.league;
        let standings = response.data.standings.results;

        const embed = new RichEmbed()
            .setTitle(`${league.name}`)
            .setColor(65415)
            .setFooter('fantasy.premierleague.com', 'https://fantasy.premierleague.com/static/libsass/plfpl/dist/img/facebook-share.png');

        var standingStr = '';
        standings.forEach((standing, i) => {
            standingStr += `${i+1}. ${standing.entry_name}\n`;
        });

        embed.addField('Standings', standingStr);

        message.channel.send(embed);
    }).catch((error) => {
        console.log(error);
    });
}

module.exports = {
    getPlayerByName,
    getFixtures,
    getDeadline,
    getLeagueRanks
}