define(['player', 'entityfactory', 'socket.io'], function(Player, EntityFactory) {
	var GameClient = Class.extend({
		init: function(host, port) {
			this.connection = null;
			this.host = host;
			this.port = port;
			this.entity_list_callback = function(entity_list) {
				console.log("Callback is not overriden!");
			}
		},
		connect: function(dispatcherMode) {
			var self = this;
			this.connection = io.connect("http://" + this.host + ":" + this.port);
			this.connection.on('entity_list', function(data) {
				var entity_list = [];
				for (var i = 0; i < data.length; i ++) {
					var entity_info = data[i];
					var kind = entity_info.kind;
					var id = entity_info.id;
					var entity = EntityFactory.createEntity(kind, id);
					entity.setPosition(entity_info.position.x, entity_info.position.y);
					entity_list.push(entity);
				}
				self.entity_list_callback(entity_list);
			});
		},
		onEntityList: function(callback) {
			this.entity_list_callback = callback;
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