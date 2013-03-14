var staticServer = require('./static-server.js');
var webSocket = require('./websocket-server.js');
var game = require('./game.js');

var fps = 30;

staticServer.start(80);
webSocket.start(8080);
game.start(fps);


var interval = setInterval(function () { 
	game.update(webSocket.getConnection());
},1000/fps);
