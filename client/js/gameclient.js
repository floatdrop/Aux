define(['player', 'socket.io'], function(Player) {
	var GameClient = Class.extend({
		init: function(host, port) {
			this.connection = null;
			this.host = host;
			this.port = port;
		},
		connect: function(dispatcherMode) {
			var self = this;
			this.connection = io.connect("http://" + this.host + ":" + this.port);
			this.connection.on('entity_list', this.entity_list_callback);
			this.connection.on('welcome', this.welcome_callback);
		},
		onEntityList: function(callback) {
			this.entity_list_callback = callback;
		},
		onWelcome: function(callback) {
			this.welcome_callback = callback;
		},
		action: function(action) {
			this.connection.emit('action', action);
		},
		angle: function(angle) {
			this.connection.emit('angle', angle);
		}
	});
	return GameClient;
});