const { Command } = require('discord.js-commando')
const { RichEmbed } = require('discord.js')

const _ = require('lodash')
const moment = require('moment-timezone')
const fplapi = require('./../../fpl/api')

module.exports = class FixturesCommand extends Command {
    constructor(client) {
        super(client, {
            group: 'fpl',
            name: 'fixtures',
            memberName: 'fixtures',
            description: 'Get the latest fixtures in GMT+8 time',
            args: [{
                key: 'gameweek',
                prompt: 'What is the game week ?',
                type: 'integer',
                default: ''
            }]
        })
    }

    run(message, {gameweek}) {
        const timezone = process.env.BOT_TIMEZONE

        Promise.all([fplapi.events(), fplapi.teams()]).then((responses) => {
            const teams =  responses[1]
            const weeks = responses[0]

            if(!gameweek)
                gameweek = _.filter(weeks, function (week) {
                    return (week.is_current && !week.finished) || week.is_next
                })[0].id

            fplapi.fixtures(gameweek).then((response) => {
                let fixtures = response.data,
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
                    .setTitle(`Game Week ${gameweek}`)
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