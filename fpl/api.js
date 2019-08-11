const axios = require('axios')
const url = "https://fantasy.premierleague.com/api"

async function fixtures(event = ''){
    return axios.get(`${url}/fixtures/?event=${event}`)
}

async function teams(){
    return bootstrap().then(function(response){
        return response.data.teams
    })
}

async function players(){
    return bootstrap().then(function(response){
        return response.data.elements
    })
}

async function positions(){
    return bootstrap().then(function (response) {
        return response.data.element_types
    })
}

async function events(){
    return bootstrap().then(function (response) {
        return response.data.events
    })
}

async function league(id, entries_page = 1, standings_page = 1){
    return axios.get(`${url}/leagues-classic/${id}/standings/?page_new_entries=${entries_page}&page_standings=${standings_page}`)
}

async function bootstrap(){
    return axios.get(`${url}/bootstrap-static/`)
}

module.exports = {
    fixtures,
    teams,
    players,
    positions,
    events,
    league
}