var vows = require('vows'),
	should = require('should'),
	zombie = require('zombie'),
	events = require('events'),
	ws = require('websocket'),
	fs = require('fs'),
	path = require('path');

GLOBAL.config = require('../../config.js');
config.server.port = 8081;
config.server.replaysPath = path.normalize(__dirname + "/../../client-build/replays");

var Server = require('../../server');

vows.describe('Aux')
	.addBatch({
	'A server': {
		topic: function () {
			return new Server();
		},
		'started': {
			topic: function (server) {
				should.exists(server);
				server.should.be.an.instanceof(Server);
				server.onReady(this.callback);
				server.start();
			},
			'and index page': {
				topic: function (server) {
					server.should.be.an.instanceof(Server);
					zombie.visit("http://localhost:" + config.server.port + "/", {
						runScripts: false
					}, this.callback);
				},
				"should return success": function (e, browser, statusCode) {
					should.not.exists(e);
					should.exists(statusCode);
					statusCode.should.equal(200);
				}
			},
			'and websocket': {
				topic: function (server) {
					server.should.be.an.instanceof(Server);
					var WebSocketClient = ws.client;
					var websocket = new WebSocketClient();
					var promise = new(events.EventEmitter)();
					websocket.on('connectFailed', function (e) {
						promise.emit('error', e);
					});
					websocket.on('connect', function (connection) {
						promise.emit('success', connection);
					});
					websocket.connect('ws://localhost:' + config.server.port + '/');
					return promise;
				},
				"should connecting to server": function (connection) {
					connection.should.be.an.instanceof(ws.connection);
				}
			},
			teardown: function (server) {
				server.should.be.an.instanceof(Server);
				server.stop();

				var files = fs.readdirSync(config.server.replaysPath);
				files.forEach(function (file) {
					fs.unlink(config.server.replaysPath + '/' + file);
				});
			}
		}
	}
})
	.export(module);