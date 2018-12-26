const { Command } = require('discord.js-commando')

const _ = require('lodash')
const moment = require('moment-timezone')
const fplapi = require('fpl-api-node')

module.exports = class DeadlineCommand extends Command {
    constructor(client) {
        super(client, {
            group: 'fpl',
            name: 'deadline',
            memberName: 'deadline',
            description: 'Get the current week\'s deadline',
        })
    }

    run(message) {
        const timezone = process.env.BOT_TIMEZONE
        
        fplapi.getEvents().then((weeks) => {
            let week = _.filter(weeks, function (week) {
                return (week.is_current && !week.finished) || week.is_next
            })[0]

            return message.channel.send(`Game Week ${week.id} Deadline: ${moment(week.deadline_time).tz(timezone).format('h:mm A DD MMM YYYY')}`)
        })
    }
}