const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const port = process.env.PORT || 3000;

const socketMap = {};

function checkSocketMap() {
    for (const socketId of Object.keys(socketMap)) {
        if (socketMap[socketId] && socketMap[socketId].lastPing < (new Date().getTime() - 10000)) {
            console.log('last ping was a while ago');
            socketMap[socketId].tampered = true;
            socketMap[socketId].socket.emit('beenawhileerror', {...socketMap[socketId]});
        }
    }
}

setInterval(() => {
    checkSocketMap();
}, 5000);

app.use(express.static('example'));

app.use((req, res, next) => {
    if (req) {
        const ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const vals = Object.values(socketMap).find(s => s.ip === ip);
        if (vals && vals.tampered) {
            res.status(403).send('CLIENT MAYBE HAS BEEN TAMPERED WITH');
        }
    }
    next();
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/2', (req, res) => {
    res.sendFile(__dirname + '/example/index.html');
})

io.on('connect', (socket) => {
    if (!socketMap[socket.id]) {
        socketMap[socket.id] = null;
    }
    console.log('socket connected', socket.id);
    socket.on('pagehash', ({ hash, url }) => {
        if (socketMap[socket.id] && socketMap[socket.id].url === url && socketMap[socket.id].hash !== hash) {
            socket.emit('hasherror', { error: 'tampered client' });
        }
        socketMap[socket.id] = { hash, url, lastPing: new Date().getTime(), ip: socket.conn.remoteAddress };
        socket.emit('received', { success: true });
    });

    socket.on('disconnect', (reason) => {
        console.log('disconnect', reason);
        delete socketMap[socket.id];
    })
});


server.listen(port, () => {
    console.log(`listening on http://localhost:${port}`);
});
