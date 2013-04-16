var fs = require('fs'),
	cls = require('./lib/class'),
	_ = require('underscore'),

	EntityFactory = require('./entityFactory');

var WorldMap = module.exports = cls.Class.extend({
	entities: [],

	init: function (map_filepath, engine) {
		this.json = JSON.parse(fs.readFileSync(map_filepath, 'utf8'));
		this.createObjects(this.json, engine);
	},

	createObjects: function (json) {
		var self = this;

		_.each(json.layers, function (layer) {
			if (layer.type === "objectgroup") {
				_.each(layer.objects, function (entity_info) {
					WorldMap.adjustInfo(entity_info);
					self.entities.push(EntityFactory.createEntity(entity_info));
				});
			}
		});
	},

});

WorldMap.adjustInfo = function (entity_info) {
	if (entity_info.polygon) {
		entity_info.polyline = entity_info.polygon;
	}
	if (entity_info.polyline) {
		entity_info.polyline.shift();
		entity_info.points = [];
		_.each(
		entity_info.polyline, function (point) {
			point.x = point.x,
			point.y = point.y;
			entity_info.points.push({
				x: point.x,
				y: point.y
			});
		});
		entity_info.points.reverse();
	}
	entity_info.width = entity_info.width / 2;
	entity_info.height = entity_info.height / 2;
	entity_info.x = entity_info.x + entity_info.width;
	entity_info.y = entity_info.y + entity_info.height;
};

return WorldMap;