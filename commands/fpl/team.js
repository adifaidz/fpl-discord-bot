const { Attachment } = require('discord.js')
const { Command } = require('discord.js-commando')
const puppeteer = require('puppeteer')
const axios = require('axios')
const fplapi = require('./../../fpl/api')
const _ = require('lodash')

module.exports = class TeamCommand extends Command {
    constructor(client) {
        super(client, {
            group: 'fpl',
            name: 'team',
            memberName: 'team',
            description: 'Get current Game Week view of team based on id',
            args: [
                {
                    key: 'team_id',
                    prompt: 'What is the team\'s id?',
                    type: 'string',
                }
            ]
        })
    }

    async run(message, {team_id}) {
        const team_apiURL = `https://fantasy.premierleague.com/api/entry/${team_id}/`
        
        let currentWeek = await fplapi.events().then((weeks) => {
            return _.filter(weeks, function (week) {
                return (week.is_current && !week.finished) || week.is_next
            })[0].id
        })

        const teamURL = `https://fantasy.premierleague.com/entry/${team_id}/event/${currentWeek}`
        var err = null
        await axios.get(team_apiURL).catch((error) => {
            err = error
        })
        
        if(err){
            if (err.response.status === 404)
                return message.reply("I couldn't find this team, is the id correct?")
            else
                return message.reply("something occurred. Please try again later.")
        }
        const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
        const page = await browser.newPage();
        page.setViewport({
            width: 1000,
            height: 900,
            deviceScaleFactor: 1
        })

        await page.goto(teamURL, {
            waitUntil: 'networkidle2'
        })
        await page.waitForSelector(".sc-bdVaja.elkxqB")

        let screenshot = await (async () => {
            const padding = 0
            const path = 'team.png'
            const selector = '.sc-bdVaja.elkxqB'

            const rect = await page.evaluate(selector => {
                document.querySelector('.Tabs__TabList-sc-1-e6ubpf-0.eWgYSm').remove()
                document.querySelectorAll('.Pitch__InfoControl-sc-1mctasb-10.hfcxVj').forEach(function (el) {
                    el.remove()
                })

                const element = document.querySelector(selector);
                if (!element)
                    return null

                const {
                    x,
                    y,
                    width,
                    height
                } = element.getBoundingClientRect();
                return {
                    left: x,
                    top: y,
                    width,
                    height,
                    id: element.id
                };
            }, selector)

            if (!rect)
                throw Error(`Could not find element that matches selector: ${selector}.`)

            return await page.screenshot({
                path,
                clip: {
                    x: rect.left - padding,
                    y: rect.top - padding,
                    width: rect.width + padding * 2,
                    height: rect.height + padding * 2
                }
            })
        })()

        return message.channel.send(new Attachment(screenshot, "team.png"));
    }
}