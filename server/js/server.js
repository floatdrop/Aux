var log = require('./log'),
	cls = require('./lib/class'),
	ws = require("./ws"),
	World = require('./world'),
	Box2dEngine = require('./b2dengine'),
	GameLoger = require('./gameLoger/gameLoger');

var Server = module.exports = cls.Class.extend({
	init: function (config) {
		this.started = false;

		this.config = config;
		this.config.port = Number(process.env.PORT) || this.config.default_port;
		this.config.host = this.config.host || process.env.IP;

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
		this._server = new ws.MultiVersionWebsocketServer(this.config.port);
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
		this.world = new World(this.config.ups, this.config.map_filepath, this.engine, this._server, this.config.debug);
		this.world.onReady(this.ready_callback);
		this.world.run();
		this.gameLoger = new GameLoger(this.config.gameLoger, this.config.logFile, this._server, this.world);
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