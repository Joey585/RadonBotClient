const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const mineflayer = require('mineflayer')
const bots = new Map()
const path = require('path');
const fs = require('fs');
const pathfinder = require('mineflayer-pathfinder').pathfinder
const Movements = require('mineflayer-pathfinder').Movements
const { GoalNear, GoalFollow } = require('mineflayer-pathfinder').goals
const pvp = require('mineflayer-pvp').plugin


function getDir() {
    if (process.pkg) {
        return path.resolve(process.execPath + "/..");
    } else {
        return path.join(require.main ? require.main.path : process.cwd());
    }
}

app.use('/', express.static(getDir() + '/webserver'));



io.on('connection', (socket) => {

    socket.on('add-bot', (username, password, host, port) => {
        console.log('Attempting to login...')
        createBot(username, password, host, port).then((bot) => {
            console.log(`Logged into ${bot.player.username}`)
            bots.set(bot.username, bot)
            const response = {
                uuid: bot.player.uuid,
                username: bot.player.username,
                ping: bot.player.ping
            }
            socket.emit('show-bot', response)

        })
    })

    socket.on('remove-bot', (username, callback) => {
        const bot = bots.get(username)
        bot.quit("deleted")
        bots.delete(username)
        callback("deleted")
    })

    socket.on('follow-user', (target) => {
        for (let [user, bot] of bots) {
            bot.loadPlugin(pathfinder)
            const mcData = require('minecraft-data')(bot.version)
            const defaultMove = new Movements(bot, mcData)

            if (target === user) return;
            const person = bot.players[target] ? bot.players[target].entity : null

            if (!person) return;
            bot.pathfinder.setMovements(defaultMove)
            bot.pathfinder.setGoal(new GoalFollow(person, 2), true)
        }
    })

    socket.on('stop-follow', () => {
        for (let [user, bot] of bots) {
            bot.pathfinder.setGoal(null)
        }
    })
    socket.on('bot-chat', (message) => {
        for (let [user, bot] of bots) {
            bot.chat(message)
        }
    })
    socket.on('bot-attack', (target) => {
        for (let [user, bot] of bots) {
            bot.loadPlugin(pathfinder)
            bot.loadPlugin(pvp)
            if (target === user) return;
            const victim = bot.players[target]
            if (!victim) return;
            bot.pvp.attack(victim.entity)
        }
    })
    socket.on('stop-attack', () => {
        for (let [user, bot] of bots) {
            bot.pvp.stop()
        }
    })
})



function createBot(u, pass, h, por){
    return new Promise((resolve, reject) => {
        const bot = mineflayer.createBot({
            username: u,
            password: pass,
            host: h,
            port: por
        })
        bot.on('spawn', () => resolve(bot))
        bot.on('error', (err) => reject(err))
    })
}


server.listen(3001, () => {
    console.log('Server Active!');
});

