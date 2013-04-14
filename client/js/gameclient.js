/* global _ */

define(function () {
	var GameClient = Class.extend({
		useBison: true,
		callbacks: {},
		init: function (host, port) {
			this.host = host;
			this.port = port;
		},
		connect: function () {
			var self = this;

			_.each(Constants.Types.Messages, function (code, name) {
				var callback = name.toLowerCase() + "_callback";
				if (self[callback] !== undefined)
					self.callbacks[code] = self[callback].bind(self);
			});

			this.socket = new WebSocket("ws://" + this.host);
			this.socket.onmessage = function (event) {
				self.decodeMessage(event, function (message) {
					self.callbacks[message.t](message.d);
				});
			};
			this.socket.onerror = function (error) {
				console.log(error);
			};
			this.socket.onclose = function (error) {
				console.log("Connection closed: " + error);
			};
		},
		decodeMessage: function (event, callback) {
			if (typeof event.data === "string") {
				callback(JSON.parse(event.data));
			} else {
				var reader = new FileReader();
				reader.readAsArrayBuffer(event.data);
				reader.onloadend = function () {
					var message = msgpack.decode(this.result);
					callback(message);
				};
			}
		},
		send: function (message) {
			if (this.useBison) {
				var encoded = msgpack.encode(message);
				this.socket.send(encoded);
			} else {
				this.socket.send(JSON.stringify(message));
			}
		},
		onEntityList: function (callback) {
			this.entitylist_callback = callback;
		},
		onWelcome: function (callback) {
			this.welcome_callback = callback;
		},
		onMap: function (callback) {
			this.map_callback = callback;
		},
		sendAction: function (action) {
			this.send({
				t: Constants.Types.Messages.Action,
				d: action
			});
		},
		sendAngle: function (angle) {
			this.send({
				t: Constants.Types.Messages.Angle,
				d: angle
			});
		}
	});
	return GameClient;
});