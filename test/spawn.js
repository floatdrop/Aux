var ws = require('websocket');

var a = ['left', 'right', 'up', 'down'];

var getAction = function () {
	return a[Math.floor(Math.random() * a.length)];
};

var move = function () {
	this.send(JSON.stringify({
		t: 2,
		d: getAction(),
		ts: (new Date()).getTime()
	}));
	setTimeout(move.bind(this), (Math.floor(Math.random() * 200)));
};

var harlemshake = function (connection) {
	console.log("player connected");
	move.bind(connection)();
};

var WebSocketClient = ws.client;

for (var i = 0; i < 24; i++) {
	var websocket = new WebSocketClient();
	websocket.on('connect', harlemshake);
	websocket.connect('ws://aux-ekb.air-labs.ru/');
}