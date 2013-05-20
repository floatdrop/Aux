var cls = require("../lib/class"),
	ws = require("../ws"),
	_ = require("underscore");

var FakeConnection = module.exports = cls.Class.extend({
	init: function (id) {
		this.id = id;
		this.listen_callbacks = [];
	},
	listen: function (callback, decode) {
		this.listen_callbacks.push({
			callback: callback,
			decode: decode
		});
	},
	listen_callback: function (message) {
		var decodeMsg = ws.decodeMessage(message);
		_.each(this.listen_callbacks, function (callback) {
			var msg = callback.decode ? decodeMsg : message;
			callback.callback(msg);
		});
	},
	onClose: function () {
	},
	send: function () {
	}
});

return FakeConnection;