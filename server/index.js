GLOBAL.klass = require("klass");
GLOBAL.Class = klass();
GLOBAL._ = require('lodash');
GLOBAL.log = require('./log.js');

log.debug("Config: ");
log.debug(GLOBAL.config);

var ws = require("./ws"),
	World = require('./world'),
	Box2dEngine = require('./b2dengine');

var Server = module.exports = Class.extend({
	initialize: function () {
		this.started = false;

		if (config.debug_level === "error") {
			this.loglevel = 0;
		} else if (config.debug_level === "debug") {
			this.loglevel = 2;
		} else if (config.debug_level === "info") {
			this.loglevel = 1;
		}

		this.ready_callback = function () {
			log.info("Server started");
		};
	},
	start: function () {

		log.info("Starting Aux game server...");

		var self = this;
		this._server = new ws.MultiVersionWebsocketServer(config.server.port);
		this._server.onConnect(function (connection) {
			self.world.connect_callback(connection);
		});
		this._server.onError(function () {
			log.error(Array.prototype.join.call(arguments, ", "));
		});
		var viewarea = {
			width: 800,
			height: 600
		};
		this.engine = new Box2dEngine(viewarea);
		this.world = new World(this.engine, this._server);
		this.world.onReady(this.ready_callback);
		this.world.run();
	},
	stop: function () {
		this.world.stop();
		this._server.stop();
	},
	onReady: function (callback) {
		this.ready_callback = callback;
	}
});

return Server;