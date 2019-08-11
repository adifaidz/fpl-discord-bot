const { Command } = require('discord.js-commando')
const { RichEmbed } = require('discord.js')
const fplapi = require('./../../fpl/api')

module.exports = class LeagueCommand extends Command {
    constructor(client) {
        super(client, {
            group: 'fpl',
            name: 'league',
            memberName: 'league',
            description: 'Get league standings by id',
            args: [
                {
                    key: 'leagueId',
                    prompt: 'What is the league id?',
                    type: 'string',
                },
                {
                    key: 'page',
                    prompt: 'Which page number to query for?',
                    type: 'integer',
                    default: 1
                }
            ]
        })
    }

    run(message, {leagueId, page}) {
        let dashIndex = leagueId.indexOf('-')
        if (dashIndex > -1)
            leagueId = leagueId.substr(dashIndex + 1)

        fplapi.league(leagueId).then((response) => {
            const league = response.data.league
            const standings = response.data.standings.results

            var standingStr = ''
            standings.forEach((standing, i) => {
                standingStr += `${i+1}. ${standing.entry_name} - ${standing.entry}\n`
            })

            const embed = new RichEmbed()
                .setTitle(`${league.name}`)
                .setColor(65415)
                .setFooter('fantasy.premierleague.com', 'https://fantasy.premierleague.com/static/libsass/plfpl/dist/img/facebook-share.png')
                .addField('Standings', standingStr)

            return message.channel.send(embed)
        }).catch((error) => {
            console.log(error)
            if(error.status == 404)
                return message.reply("I couldn't find league, is the id correct?")
            return message.reply("something occurred. Please try again later.")
        })
    }
}