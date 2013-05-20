var cls = require("../lib/class"),
	fs = require('fs'),
	_ = require("underscore"),
	FakeConnection = require('./fakeConnection'),
	Player = require('../entities/player');

require('../../../client/js/constants');

var GameLoger = module.exports = cls.Class.extend({
	init: function (state, logFile, server, world) {
		var self = this;
		this.server = server;
		this.world = world;
		this.logFile = logFile;
		this.startTime = new Date();
		this.oldCommandTime = this.startTime.getTime();
		this.commands = [];
		this.curCommand = 0;
		this.sockets = {};

		if (state === Constants.Types.GameLogerState.WriteLog) {
			this.path = __dirname + "/../../../replays/" + this.startTime.toString().split(':').join('-');
			world.onPlayerCreated(function (player) {
				var connection = player.connection,
					msg = new Buffer(JSON.stringify(player.getPosition()));
				self.writeLog(connection, msg, GameLoger.MsgType.Connect);
				connection.listen(function (message) {
					self.writeLog(connection, message.binaryData, GameLoger.MsgType.Action);
				});
			});
		} else if (state === Constants.Types.GameLogerState.ReadLog) {
			if (this.world.started) {
				this.world.stop();
			}
			
			this.listen_callbacks = {};
			this.listen_callbacks[Constants.Types.GameLogerMsg.Play] = this.onRunLogPlayer.bind(this);
			this.listen_callbacks[Constants.Types.GameLogerMsg.Stop] = this.onStopLogPlayer.bind(this);
			this.listen_callbacks[Constants.Types.GameLogerMsg.Pause] = this.onPauseLogPlayer.bind(this);

			this.execute_callbacks = {};
			this.execute_callbacks[GameLoger.MsgType.Action] = this.onAction.bind(this);
			this.execute_callbacks[GameLoger.MsgType.Connect] = this.onConnect.bind(this);

			world.onPlayerConnect(function () {});
			world.onPlayerDisconnect(function () {});
			server.onConnect(function (connection) {
				var player = new Player(new FakeConnection("fake"), "id", true);
				player.connection = connection;
				player.send(Constants.Types.Messages.Welcome, {"playGameLog": true});

				world.updatePlayers = function () {
					player.sendEntities(world.engine.getEntities());
				};

				connection.listen(function (message) {
					var callback = self.listen_callbacks[message.t];
					if (callback) {
						callback();
					}
				}, true);
			});
		}
	},

	writeLog: function (connection, binaryMsg, msgtype) {
		var id = new Buffer(connection.id),
			buf = new Buffer(13 + id.length + binaryMsg.length),
			curTimeMs = new Date().getTime(),
			time = curTimeMs - this.oldCommandTime;
		
		this.oldCommandTime = curTimeMs;

		buf[0] = msgtype;
		buf.writeUInt32BE(time, 1);
		buf.writeUInt32BE(id.length, 5);
		buf.writeUInt32BE(binaryMsg.length, 9);
		id.copy(buf, 13);
		binaryMsg.copy(buf, 13 + id.length);

		fs.appendFile(this.path, buf, function (err) {
			if (err) throw err;
		});
	},

	readLog: function () {
		var data = fs.readFileSync("replays/" + this.logFile),
			offset = 0,
			commands = [];
		while (offset < data.length) {
			var msgType = data[offset],
				time = data.readUInt32BE(offset + 1),
				idLen = data.readUInt32BE(offset + 5),
				msgLen = data.readUInt32BE(offset + 9),
				id = new Buffer(idLen),
				msg = new Buffer(msgLen);

			offset += 13;
			data.copy(id, 0, offset, offset + idLen);
			offset += idLen;
			data.copy(msg, 0, offset, offset + msgLen);
			offset += msgLen;

			commands.push({
				time: time,
				id: JSON.parse(id),
				message: msg,
				type: msgType
			});
		}
		return commands;
	},

	onRunLogPlayer: function () {
		if (this.world.started) {
			return;
		}
		if (this.commands.length === 0) {
			this.commands = this.readLog();
			this.curCommand = 0;
		}
		this.world.run();
		this.executeNextCommand();
	},
	executeCurCommand: function (command) {
		this.execute_callbacks[command.type](command);
	},
	executeNextCommand: function () {
		if (this.curCommand >= this.commands.length) return;
		var self = this,
			command = this.commands[this.curCommand++];
		this.timeoutId = setTimeout(function () {
			self.executeCurCommand(command);
			self.executeNextCommand();
		}, command.time);
	},
	onAction: function (command) {
		var message = {
			type: 'binary',
			binaryData: command.message
		};
		this.sockets[command.id].listen_callback(message);
	},
	onConnect: function (command) {
		var connection = new FakeConnection(command.id);
		this.sockets[command.id] = connection;
		this.world.onPlayerCreated(function (player) {
			var pos = JSON.parse(command.message);
			player.setPosition(pos.x, pos.y);
		});
		this.world.playerConnect(connection);
	},
	onStopLogPlayer: function () {
		if (!this.world.started) {
			return;
		}
		this.onPauseLogPlayer();
		this.commands = [];
		this.world.engine.clearWorld();
		this.world.map.createObjects(this.world.map.json);
		this.world.engine.addEntities(this.world.map.entities);
	},
	
	onPauseLogPlayer: function () {
		if (!this.world.started) {
			return;
		}
		this.world.stop();
		clearTimeout(this.timeoutId);
	}
});



GameLoger.MsgType = {
	Action: 0,
	Connect: 1
};

return GameLoger;