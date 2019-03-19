const { Command } = require('discord.js-commando')
const { RichEmbed } = require('discord.js')

const _ = require('lodash')
const moment = require('moment-timezone')
const axios = require('axios')
const fplapi = require('fpl-api-node')

module.exports = class FixturesCommand extends Command {
    constructor(client) {
        super(client, {
            group: 'fpl',
            name: 'fixtures',
            memberName: 'fixtures',
            description: 'Get the latest fixtures in GMT+8 time',
        })
    }

    run(message) {
        const timezone = process.env.BOT_TIMEZONE

        Promise.all([fplapi.getEvents(), fplapi.getTeams()]).then((responses) => {
            const weeks = responses[0]
            const teams =  responses[1]

            let week = _.filter(weeks, function (week) {
                return (week.is_current && !week.finished) || week.is_next
            })[0]

            axios.get(`https://fantasy.premierleague.com/drf/event/${week.id}/live`).then((response) => {
                let fixtures = response.data.fixtures,
                    gameStr = '', teamGames = []

                fixtures.forEach((fixture) => {
                    var matchedTeams = {}
                    for (var i = 0; i < teams.length; i++) {
                        if (teams[i].id === fixture.team_h)
                            matchedTeams.home = teams[i].short_name
                        else if (teams[i].id === fixture.team_a)
                            matchedTeams.away = teams[i].short_name

                        if (matchedTeams.away && matchedTeams.home)
                            break
                    }

                    gameStr += `**${matchedTeams.home}** vs **${matchedTeams.away}**\n${moment(fixture.kickoff_time).tz(timezone).format('hh:mm A DD MMM YYYY')}\n\n`
                    teamGames.push(matchedTeams.home, matchedTeams.away)
                })

                let doubleGameTeams = _.filter(teamGames, (val, i, iteratee) => _.includes(iteratee, val, i + 1));
                if (doubleGameTeams.length)
                    gameStr += `**Double Game Teams : \n${doubleGameTeams.join(', ')}**\n\n`

                const embed = new RichEmbed()
                    .setTitle(`Game Week ${week.id}`)
                    .setColor(65415)
                    .setFooter('fantasy.premierleague.com', 'https://fantasy.premierleague.com/static/libsass/plfpl/dist/img/facebook-share.png')
                    .addField('----------------------', gameStr)

                return message.channel.send(embed)
            }).catch((error) => {
                console.log(error)
                return message.reply("something occurred. Please try again later.")
            })
        })
    }
}