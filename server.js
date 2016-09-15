var express = require('express'),
    mongoose = require('mongoose'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    path = require('path');

var users = [],
    connections = [];

app.use(express.static(path.join(__dirname, './public')));
app.use(express.static(path.join(__dirname, './bower_components')));

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
    if (req.method == 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, './index.html'));
});

io.sockets.on('connection', function (socket) {
    connections.push(socket);

    socket.on('disconnect', function (data) {
        users.splice(users.indexOf(socket.username), 1);
        updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        io.sockets.emit('goodbye', socket.username);
    });

    socket.on('new user', function () {
        var username = 'Guest ' + users.length;
        users.push(username);
        socket.username = username;
        socket.emit('welcome', username);
        updateUsernames();
    })

    socket.on('send message', function (data) {
        io.sockets.emit('new message', {
            user: socket.username,
            message: data
        });
    });

    socket.on('change userName', function (data, callback) {
        callback(true);
        var index = users.indexOf(data.oldName);
        users[index] = data.newName;
        socket.username = data.newName;
        updateUsernames();
        io.sockets.emit('userName changed', data);
    });

    function updateUsernames() {
        io.sockets.emit('get users', users);
    }
});

server.listen(3000, function () {
    console.log('It\'s going down in 3000');
});
