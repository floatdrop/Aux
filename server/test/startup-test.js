var vows = require('vows'),
	should = require('should'),
	Browser = require('zombie');

var Server = require('./main');

var StaticPort = 8080;

vows.describe('Aux').addBatch({
	'A server': {
		topic: new Server({
			port: 8081,
			static_port: StaticPort,
			debug_level: "debug",
		}),
		'started': {
			topic: function (server) {
				server.start(this.callback);
			},
			'and return 200 code on static port': function (error, result) {
				should.not.exists(error);
				should.exist(result);

				var browser = new Browser();
				browser.visit("http://localhost:" + StaticPort + "/", function () {
					should.ok(browser.success);
				});
			}
		}
	}
}).export(module);