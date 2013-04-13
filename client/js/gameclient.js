define(function () {
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
			this.callbacks = {};
			this.callbacks[Constants.Types.Messages.Welcome] = this.welcome_callback;
			this.callbacks[Constants.Types.Messages.Map] = this.map_callback;
			this.callbacks[Constants.Types.Messages.EntityList] = this.entity_list_callback;
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
				// this.socket.send(new Buffer(msgpack.encode(message), "binary").buffer);
				throw "Not implemented yet";
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