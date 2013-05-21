var cls = require("./lib/class"),
	wsserver = require("websocket-server"),
	miksagoConnection = require('websocket-server/lib/ws/connection'),
	worlizeRequest = require('websocket').request,
	http = require('http'),
	_ = require('underscore'),
	msgpack = require('msgpack'),
	WS = {},
	log = require("./log"),
	useBison = true;

module.exports = WS;


/**
 * Abstract Server and Connection classes
 */
var Server = cls.Class.extend({
	init: function (port) {
		this.port = port;
	},

	onConnect: function (callback) {
		this.connection_callback = callback;
	},

	onError: function (callback) {
		this.error_callback = callback;
	},

	broadcast: function () {
		throw "Not implemented";
	},

	forEachConnection: function (callback) {
		_.each(this._connections, callback);
	},

	addConnection: function (connection) {
		this._connections[connection.id] = connection;
	},

	removeConnection: function (id) {
		delete this._connections[id];
	},

	getConnection: function (id) {
		return this._connections[id];
	}
});


var Connection = cls.Class.extend({
	init: function (id, connection, server) {
		this._connection = connection;
		this._server = server;
		this.id = id;
	},

	onClose: function (callback) {
		this.close_callback = callback;
	},

	listen: function (callback) {
		this.listen_callback = callback;
	},

	broadcast: function () {
		throw "Not implemented";
	},

	send: function () {
		throw "Not implemented";
	},

	sendUTF8: function () {
		throw "Not implemented";
	},

	close: function (logError) {
		log.info("Closing connection to " + this._connection.remoteAddress + ". Error: " + logError);
		this._connection.close();
	}
});



/**
 * MultiVersionWebsocketServer
 *
 * Websocket server supporting draft-75, draft-76 and version 08+ of the WebSocket protocol.
 * Fallback for older protocol versions borrowed from https://gist.github.com/1219165
 */
WS.MultiVersionWebsocketServer = Server.extend({
	worlizeServerConfig: {
		// All options *except* 'httpServer' are required when bypassing
		// WebSocketServer.
		maxReceivedFrameSize: 0x10000,
		maxReceivedMessageSize: 0x100000,
		fragmentOutgoingMessages: true,
		fragmentationThreshold: 0x4000,
		keepalive: true,
		keepaliveInterval: 20000,
		assembleFragments: true,
		// autoAcceptConnections is not applicable when bypassing WebSocketServer
		// autoAcceptConnections: false,
		disableNagleAlgorithm: true,
		closeTimeout: 5000
	},
	_connections: {},
	_counter: 0,

	init: function (port) {
		var self = this;

		this._super(port);

		var express = require('express');
		var app = express();
		var __dirname = './client';
		app.use(express.static(__dirname));
		app.use(express.directory(__dirname));

		this._httpServer = http.createServer(app);
		this._httpServer.listen(port, function () {
			log.info("Server is listening on http://localhost:" + port);
		});

		this._miksagoServer = wsserver.createServer();
		this._miksagoServer.server = this._httpServer;
		this._miksagoServer.addListener('connection', function (connection) {
			// Add remoteAddress property
			connection.remoteAddress = connection._socket.remoteAddress;

			// We want to use "sendUTF" regardless of the server implementation
			connection.sendUTF = connection.send;
			var c = new WS.miksagoWebSocketConnection(self._createId(), connection, self);

			if (self.connection_callback) {
				self.connection_callback(c);
			}
			self.addConnection(c);
		});

		this._httpServer.on('upgrade', function (req, socket, head) {
			if (typeof req.headers['sec-websocket-version'] !== 'undefined') {
				// WebSocket hybi-08/-09/-10 connection (WebSocket-Node)
				var wsRequest = new worlizeRequest(socket, req, self.worlizeServerConfig);

				wsRequest.readHandshake();
				var wsConnection = wsRequest.accept(wsRequest.requestedProtocols[0], wsRequest.origin);
				var c = new WS.worlizeWebSocketConnection(self._createId(), wsConnection, self);
				if (self.connection_callback) {
					self.connection_callback(c);
				}
				self.addConnection(c);

			} else {
				// WebSocket hixie-75/-76/hybi-00 connection (node-websocket-server)
				if (req.method === 'GET' && (req.headers.upgrade && req.headers.connection) && req.headers.upgrade.toLowerCase() === 'websocket' && req.headers.connection.toLowerCase() === 'upgrade') {
					new miksagoConnection(self._miksagoServer.manager, self._miksagoServer.options, req, socket, head);
				}
			}
		});
	},
	_createId: function () {
		return '5' + Math.floor(Math.random() * 99) + '' + (this._counter++);
	},
	broadcast: function (message) {
		this.forEachConnection(function (connection) {
			connection.send(message);
		});
	},
	onRequestStatus: function (status_callback) {
		this.status_callback = status_callback;
	},
	stop: function () {
		this._httpServer.close();
	}
});


/**
 * Connection class for Websocket-Node (Worlize)
 * https://github.com/Worlize/WebSocket-Node
 */
WS.worlizeWebSocketConnection = Connection.extend({
	init: function (id, connection, server) {
		var self = this;

		this._super(id, connection, server);

		this._connection.on('message', function (message) {
			if (self.listen_callback) {
				if (message.type !== "utf8") {
					var msg = String.fromCharCode.apply(null, new Uint8Array(message.binaryData));
					var decoded = msgpack.unpack(new Buffer(msg, "binary"));
					self.listen_callback(decoded);
				} else {
					self.listen_callback(JSON.parse(message.utf8Data));
				}
			}
		});

		this._connection.on('close', function () {
			if (self.close_callback) {
				self.close_callback();
			}
			/*delete */
			self._server.removeConnection(self.id);
		});
	},

	send: function (message) {
		if (useBison) {
			var encoded = msgpack.pack(message);
			this.sendBytes(new Buffer(encoded, "binary"));
		} else {
			this.sendUTF8(JSON.stringify(message));
		}
	},
	sendBytes: function (data) {
		this._connection.sendBytes(data);
	},
	sendUTF8: function (data) {
		this._connection.sendUTF(data);
	}
});


/**
 * Connection class for websocket-server (miksago)
 * https://github.com/miksago/node-websocket-server
 */
WS.miksagoWebSocketConnection = Connection.extend({
	init: function (id, connection, server) {
		var self = this;

		this._super(id, connection, server);

		this._connection.addListener("message", function (message) {
			if (self.listen_callback) {
				self.listen_callback(JSON.parse(message));
			}
		});

		this._connection.on('close', function () {
			if (self.close_callback) {
				self.close_callback();
			}
			/*delete*/
			self._server.removeConnection(self.id);
		});
	},

	send: function (message) {
		this.sendUTF8(JSON.stringify(message));
	},

	sendUTF8: function (data) {
		this._connection.send(data);
	}
});