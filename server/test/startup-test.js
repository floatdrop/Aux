var vows = require('vows'),
	should = require('should'),
	zombie = require('zombie');

var Server = require('../js/main');

vows.describe('Aux').addBatch({
	'A server': {
		topic: function () {
			return new Server({
				port: 8081,
				debug_level: "debug",
				map_filepath: "maps/world_server.json",
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
			}
		}
	}
}).export(module);