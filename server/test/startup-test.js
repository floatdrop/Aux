var vows = require('vows'),
	should = require('should'),
	zombie = require('zombie');

var Server = require('../js/main');

var StaticPort = 8085;

vows.describe('Aux').addBatch({
	'A server': {
		topic: function () {
			return new Server({
				port: 8081,
				static_port: StaticPort,
				debug_level: "error",
				map_filepath: "maps/world_server.json",
			});
		},
		'started': {
			topic: function (server) {
				should.exists(server);
				server.should.be.an.instanceof(Server);
				server.start(this.callback);
			},
			'and index page': {
				topic: function (err, server) {
					server.should.be.an.instanceof(Server);
					zombie.visit("http://localhost:" + server.config.static_port + "/", {
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