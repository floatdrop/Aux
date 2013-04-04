var vows = require('vows'),
	should = require('should'),
	zombie = require('zombie');

var Server = require('../js/main');

var StaticPort = 8080;

vows.describe('Aux').addBatch({
	'A server': {
		topic: function () {
			return new Server({
				port: 8081,
				static_port: StaticPort,
				debug_level: "debug",
				map_filepath: "maps/world_server.json",
			});
		},
		'started': {
			topic: function (server) {
				server.start(this.callback);
			},
			'and index page': {
				topic: function () {
					zombie.visit("http://localhost:" + StaticPort + "/", {
						runScripts: false
					}, this.callback);
				},
				"should return success": function (e, browser) {
					should.not.exists(e);
					should.exists(browser);
					should.exists(browser.statusCode);
					browser.statusCode.should.equal(200);
				}
			}
		}
	}
}).export(module);