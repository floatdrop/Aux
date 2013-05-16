var vows = require('vows'),
	should = require('should'),
	zombie = require('zombie'),
	events = require('events'),
	ws = require('websocket');

var Server = require('../server/js/main');

vows.describe('Aux')
	.addBatch({
	'A server': {
		topic: function () {
			return new Server({
				port: 8081,
				debug_level: "debug",
				map_filepath: "./client/assets/world/smallworld.json",
			});
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
					zombie.visit("http://localhost:" + server.config.port + "/", {
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
					websocket.connect('ws://localhost:' + server.config.port + '/');
					return promise;
				},
				"should connecting to server": function (connection) {
					connection.should.be.an.instanceof(ws.connection);
				}
			},
			teardown: function (server) {
				server.should.be.an.instanceof(Server);
				server.stop();
			}
		}
	}
})
	.export(module);