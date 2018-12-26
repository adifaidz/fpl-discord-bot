const { Command } = require('discord.js-commando')
const { RichEmbed } = require('discord.js')

const _ = require('lodash')
const accents = require('remove-accents')
const fplapi = require('fpl-api-node')

module.exports = class InfoCommand extends Command {
    constructor(client) {
        super(client, {
            group: 'fpl',
            name: 'info',
            memberName: 'info',
            description: 'Get player info by name',
            args: [
                {
                    key: 'name',
                    prompt: 'What is the name of the player?',
                    type: 'string',
                }
            ]
        })
    }

    run(message, {name}) {
        let query = name.split(' ')
        let queryRegex = new RegExp("(?=.*" + query.join(")(?=.*") + ").*")
        fplapi.getElements().then((players) => {
            let player = _.filter(players, function (player) {
                let player_name = accents.remove((player.first_name + ' ' + player.second_name))
                return player_name.toLowerCase().match(queryRegex)
            })

            if (player.length === 0) 
                return message.reply("I couldn't find this player, is his name spelled correctly?")

            player = player[0]

            fplapi.getElementTypes().then((positions) => {
                let position = _.filter(positions, function (position) {
                    return position.id === player.element_type
                })

                position = position[0]

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
                    .setFooter('fantasy.premierleague.com', 'https://fantasy.premierleague.com/static/libsass/plfpl/dist/img/facebook-share.png')

                return message.channel.send(embed)
            })
        })
    }
}