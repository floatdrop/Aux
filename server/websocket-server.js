var connections = [];
var app = require('http').createServer();
var io = require('socket.io').listen(app);

io.set('log level', 1);
app.listen(8080);

io.sockets.on('connection', function (socket) {
    connections.push(socket);
});

init(connections);
