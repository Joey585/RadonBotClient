const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const mineflayer = require("mineflayer");
const io = new Server(server);
const Convert = require('ansi-to-html')
const convert = new Convert()
const radarPlugin = require('mineflayer-radar')(mineflayer);
const path = require('path');
require('dotenv').config()

console.log(process.env.IP)

function getDir() {
    if (process.pkg) {
        return path.resolve(process.execPath + "/..");
    } else {
        return path.join(require.main ? require.main.path : process.cwd());
    }
}


app.use('/', express.static(getDir() + '/webserver'));
// app.get('/', (req, res) => {
//     res.sendFile(getDirPath() + '/webserver/index.html');
// });

io.on('connection', (socket) => {
    bot.on('health', () => {
        socket.emit('health', Math.round(bot.health));
    })
    bot.once('spawn', () => {
        // console.log('Spawned!')
        // console.log(bot.entity.position.x)
        // console.log(bot.players)

    })
    bot.on('move', () => {
        const jsonData = {
            username: bot.username,
            x: Math.round(bot.entity.position.x),
            y: Math.round(bot.entity.position.y),
            z: Math.round(bot.entity.position.z)
        }
        socket.emit('botData', jsonData)
    })
    socket.on('chat-send', (data) => {
        bot.chat(data)
    })
    // bot.on('messagestr', (message) => {
    //     socket.emit('chat', message)
    // })
    bot.on('message', (message) => {
        const msg = message.toAnsi()
        const data = convert.toHtml(msg)
        socket.emit('chat', data)
    })

    function filterPlayer(emit, entity){
        const newEntity = Object.fromEntries(
            Object.entries(entity).filter(([key, value]) => key === 'type')
        )
        if (newEntity.type === 'player') {
            if (entity.username === bot.username) return;
            socket.emit(emit, entity);
        }
    }

    bot.on('move', function() {
        socket.emit('entity', bot.entity);
    });

    bot.on('entitySpawn', function(entity) {
        filterPlayer('entitySpawn', entity)
    });

    bot.on('entityGone', function(entity) {
        filterPlayer('entityGone', entity)
    });

    bot.on('entityMoved', function(entity) {
        filterPlayer('entityMoved', entity)
    });

    socket.on('controlState', function(state) {
        bot.setControlState(state.name, state.value);
    });

    socket.on('look', function(look) {
        bot.look(look.yaw, look.pitch);
    });

});

const bot = mineflayer.createBot({
    username: process.env.EMAIL,
    password: process.env.PASSWORD,
    host: process.env.IP,
    port: process.env.PORT,
})




server.listen(3000, () => {
    console.log('Server Active!');
});