var fs = require('fs'),
	cls = require('./lib/class'),
	_ = require('underscore'),
	EntityFactory = require('./entities/entityFactory');

var WorldMap = module.exports = cls.Class.extend({
	init: function (map_filepath, engine) {
		this.isLoaded = false;
		this.data = {};
		var self = this;

		fs.readFile(map_filepath, 'utf8', function (err, data) {
			if (err) {
				throw new Error(err);
			}
			self.data = JSON.parse(data);
			self.isLoaded = true;
			self.fillWorld(self.data, engine);
		});
	},

	adjustInfo: function (entity_info) {
		var scale = 100;
		if (entity_info.polyline) {
			entity_info.polyline.shift();
			_.each(
				entity_info.polyline, function (point) {
				point.x = point.x / scale,
				point.y = point.y / scale;
			});
		}
		entity_info.width = entity_info.width / scale / 2;
		entity_info.height = entity_info.height / scale / 2;
		entity_info.x = entity_info.x / scale + entity_info.width;
		entity_info.y = entity_info.y / scale + entity_info.height;
	},

	sendMap: function (player) {
		if (this.isLoaded) {
			player.send(Constants.Types.Messages.Map, this.data);
		} else {
			setTimeout(this.sendMap, 1000);
		}
	},

	fillWorld: function (data, engine) {
		var self = this;

		var objects = _.find(data.layers, function (layer) { 
			return layer.name === "objects";
		}).objects;

		_.each(objects, function (entity_info) {
			self.adjustInfo(entity_info);
			var obj = EntityFactory.createEntity(entity_info);
			engine.addEntity(obj);
		});
	}
});

return WorldMap;