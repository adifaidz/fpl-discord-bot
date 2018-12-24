const { Command } = require('discord.js-commando')
const { RichEmbed } = require('discord.js')

module.exports = class HelpCommand extends Command {
    constructor(client) {
        super(client, {
            group: 'fpl',
            name: 'help',
            memberName: 'help',
            description: 'Displays a list of available commands, or detailed information for a specified command',
        })
    }

    run(message) {
        const prefix = process.env.BOT_PREFIX
        const embed = new RichEmbed()
            .setTitle('List of commands')
            .setColor(65415)
            .setThumbnail(`https://fantasy.premierleague.com/static/libsass/plfpl/dist/img/facebook-share.png`)
            .addField('----------------------',
                `**${prefix}info [name]**\n` +
                'Get player info by name\n\n' +
                `**${prefix}fixtures**\n` +
                'Get the latest fixtures in GMT+8 time\n\n' +
                `**${prefix}deadline**\n` +
                'Get the current week deadline\n\n' +
                `**${prefix}league [league ID]**\n` +
                'Get league standings by id\n\n' +
                '***Report any issues at [Github](https://github.com/adifaidz/fpl-discord-bot)***')
            .setFooter('fantasy.premierleague.com', 'https://fantasy.premierleague.com/static/libsass/plfpl/dist/img/facebook-share.png')
        message.channel.send(embed)
    }
}