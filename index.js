const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const socketMap = {};

function getSocketMap() {
    return socketMap;
}

function setSocketMap(socketId, vals) {
    socketMap[socketId] = {
       ...vals,
    };
}

function checkSocketMap() {
    for (const socketId of Object.keys(socketMap)) {
        if (socketMap[socketId].lastPing < new Date().getTime() - 10000) {
            console.log('last ping was a while ago');
            socketMap[socketId].tampered = true;
            // socketMap[socketId].socket.emit('beenawhileerror', {...socketMap[socketId]});
        }
    }
}

function checkState(req) {
    if (req) {
        console.log('latest socket map', JSON.parse(JSON.stringify(getSocketMap())))
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
        const vals = Object.values(getSocketMap()).find(s => s.ip === ip);
        console.log(vals);
        if (vals && vals.tampered) {
            res.status(403).send('You have been banned');
        }
        
    
    }
}

setInterval(() => {
    checkSocketMap();
}, 5000);

app.use((req, res, next) => {
    checkState(req);
    next();
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/2', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

io.on('connect', (socket) => {
    if (!socketMap[socket.id]) {
        socketMap[socket.id] = null;
    }
    console.log('socket connected', socket.id);
    socket.on('pagehash', ({hash, url}) => {
        if (socketMap[socket.id] && socketMap[socket.id].url === url && socketMap[socket.id].hash !== hash) {
            socket.emit('hasherror', {error: 'tampered client'});
        }
        setSocketMap(socket.id, {hash, url, lastPing: new Date().getTime(), ip: socket.conn.remoteAddress});
        // socketMap[socket.id + ''] = {hash, url, lastPing: new Date().getTime(), ip: socket.conn.remoteAddress};
        console.log('received', socketMap[socket.id + '']);
        // console.log(socket)
    });

    socket.on('disconnect', (reason) => {
        console.log('disconnect', reason);
        delete socketMap[socket.id];
    })
});


server.listen(3000, () => {
  console.log('listening on http://localhost:3000');
});

// app.get('/stream', function (req, res, next) {
//     //when using text/plain it did not stream
//     //without charset=utf-8, it only worked in Chrome, not Firefox
//     res.setHeader('Content-Type', 'text/html; charset=utf-8');
//     // res.setHeader('Transfer-Encoding', 'chunked');

//     res.write('Thinking...');
//     sendAndSleep(res, 1);
// });


// var sendAndSleep = function (response, counter) {
//     if (counter > 10) {
//         response.write(`<script>alert('done');</script>`)
//         response.end();
//     } else {
//         response.write(' ;i=' + counter);
//         counter++;
//         setTimeout(function () {
//             sendAndSleep(response, counter);
//         }, 1000)
//     };
// };

// app.listen(3000, () => console.log('Example app listening on port http://localhost:3000'));