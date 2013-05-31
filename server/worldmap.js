var fs = require('fs'),
	EntityFactory = require('./entityFactory');

var WorldMap = module.exports = Class.extend({

	init: function (map_filepath, engine) {
		this.json = JSON.parse(fs.readFileSync(map_filepath, 'utf8'));
		this.createObjects(this.json, engine);
	},

	createObjects: function (json) {
		var self = this;

		this.entities = [];
		this.spawnregions = [];
		_.each(json.layers, function (layer) {
			if (layer.type === "objectgroup" && layer.name === "objects") {
				_.each(layer.objects, function (entity_info) {
					WorldMap.adjustInfo(entity_info);
					self.entities.push(EntityFactory.createEntity(entity_info));
				});
			}
			if (layer.type === "objectgroup" && layer.name === "spawnplaces") {
				_.each(layer.objects, function (entity_info) {
					self.spawnregions.push(entity_info);
				});
			}
		});
	},
	getSpawnPoint: function () {
		var region = this.spawnregions[Math.floor(Math.random() * this.spawnregions.length)];
		return {
			x: Math.floor(region.x + Math.random() * region.width),
			y: Math.floor(region.y + Math.random() * region.height)
		};
	}

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
			point.x = point.x;
			point.y = point.y;
			entity_info.points.push({
				x: point.x,
				y: point.y
			});
		});
		entity_info.points.reverse();
	}
};

return WorldMap;