/* global _ */

define(function () {
	var Client = Class.extend({
		callbacks: {},
		init: function (host, port) {
			this.host = host;
			this.port = port;

			this.network = new LINK.Network({binary: true});

		},
		connect: function () {
			var self = this;

			_.each(Constants.Types.Messages, function (code, name) {
				var callback = name.toLowerCase() + "_callback";
				if (self[callback] !== undefined)
					self.callbacks[code] = self[callback].bind(self);
			});

			this.network.onmessage = function (event) {
				self.decodeMessage(event, function (message) {
					self.callbacks[message.t](message.d);
				});
			};
			this.network.onerror = function (error) {
				console.log(error);
			};
			this.network.onclose = function (error) {
				console.log("Connection closed: " + error);
			};

			this.network.connect(this.host, this.port);
		},
		onRemoveList: function (callback) {
			this.removelist_callback = callback;
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
			this.network.send({
				t: Constants.Types.Messages.Action,
				d: action
			});
		},
		sendAngle: function (angle) {
			this.network.send({
				t: Constants.Types.Messages.Angle,
				d: angle
			});
		},
		sendShoot: function () {
			this.network.send({
				t: Constants.Types.Messages.Shoot,
				d: null
			});
		}
	});
	return Client;
});