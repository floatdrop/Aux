define(['lib/bison'], function () {
	var GameClient = Class.extend({
		init: function (host, port) {
			this.socket = null;
			this.host = host;
			this.port = port;
			this.useBison = false;
		},
		connect: function () {
			var self = this;
			this.socket = new WebSocket("ws://" + this.host);
			this.socket.onmessage = function (event) {
				var message = self.decodeMessage(event);
				self.callbacks[message.t](message.d);
			};
			this.socket.onerror = function (error) {
				console.log(error);
			};
			this.socket.onclose = function (error) {
				console.log("Connection closed: " + error);
			};
			this.callbacks = {};
			this.callbacks[Constants.Types.Messages.Welcome] = this.welcome_callback;
			this.callbacks[Constants.Types.Messages.Map] = this.map_callback;
			this.callbacks[Constants.Types.Messages.EntityList] = this.entity_list_callback;
		},
		decodeMessage: function (event) {
			if (this.useBison) {
				return window.BISON.decode(event.data);
			} else {
				return JSON.parse(event.data);
			}
		},
		send: function (message) {
			if (this.useBison) {
				this.socket.send(window.BISON.encode(message));
			} else {
				this.socket.send(JSON.stringify(message));
			}
		},
		onEntityList: function (callback) {
			this.entity_list_callback = callback;
		},
		onWelcome: function (callback) {
			this.welcome_callback = callback;
		},
		onMap: function (callback) {
			this.map_callback = callback;
		},
		action: function (action) {
			this.send({
				t: Constants.Types.Messages.Action,
				d: action
			});
		},
		angle: function (angle) {
			this.send({
				t: Constants.Types.Messages.Angle,
				d: angle
			});
		}
	});
	return GameClient;
});