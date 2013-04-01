var vows = require('vows'),
	should = require('should'),
	zombie = require('zombie');

var Server = require('../js/main');

var StaticPort = 8080;

vows.describe('Aux').addBatch({
	'A server': {
		topic: function() { 
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
				topic: function (error, server) {
					zombie.visit("http://localhost:" + StaticPort + "/", { runScripts: false }, this.callback);
				},
				"should return success": function (e, browser, status) {
					console.log(e, browser, status);
					should.not.exist(e);
					should.exists(browser);
					should.ok(browser.success);
				}
			}
		}
	}
}).export(module);