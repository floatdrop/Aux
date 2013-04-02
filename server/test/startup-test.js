var vows = require('vows'),
	should = require('should'),
	zombie = require('zombie');

var Server = require('../js/main');

var StaticPort = 8082;

vows.describe('Aux').addBatch({
	'A server': {
		topic: function () { 
			return new Server({
				port: 8081,
				static_port: StaticPort,
				debug_level: "error",
			}); 
		},
		'started': {
			topic: function (server) {
				server.start(this.callback);
			},
			'and index page': {
				topic: function () {
					zombie.visit("http://localhost:" + StaticPort + "/", { runScripts: false }, this.callback);
				},
				"should return success": function (e, browser) {
					should.ok(browser.success);
				}
			}
		}
	}
}).export(module);