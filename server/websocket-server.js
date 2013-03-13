var connections = [];
var http = require('http'),
	socketIo = require('socket.io');

function start(port){
	server = http.createServer();
	io = socketIo.listen(server);
	io.set('log level', 1);
	server.listen(port);

	io.sockets.on('connection', function (socket) {
		connections.push(socket);
	});
}

exports.start = start;
exports.getConnection = function(){
	return connections;
}