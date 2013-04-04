var fs = require('fs'),
	cls = require('./lib/class'),
	_ = require('underscore'),
	CommonEntity = require('./commonEntity');

var WorldMap = module.exports = cls.Class.extend({
	init: function (config, engine) {
		this.isLoaded = false;
		this.data = {};
		this.engine = engine;
		var self = this;

		fs.readFile(config.map_filepath, 'utf8', function (err, data) {
			if (err) {
				return console.log(err);
			}
			self.data = JSON.parse(data);
			self.isLoaded = true;
			console.log("map loaded");
			self.fillWorld(self.data, self.engine);
		});
	},

	sendMap: function (socket) {
		if (this.isLoaded) {
			socket.emit("map", this.data);
			console.log("map sended");
		} else {
			setTimeout(this.sendMap, 100);
		}
	},

	fillWorld: function (data, engine) {

		var objects = _.find(data.layers, function (layer) { 
			return layer.name === "objects";
		}).objects;

		_.each(objects, function (object) {
			var o = new CommonEntity(null, engine.b2w, object, engine);
			if (o.type !== "border" && object.width !== 0 && object.height !== 0) {
				engine.addEntity(o);
			}
		});
	}
});

return WorldMap;