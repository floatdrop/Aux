/* global _ */

define([], function () {
	var Map = Class.extend({
		init: function (game) {
			this.isLoaded = false;
			this.tilesets = [];
			this.layers = [];
			this.game = game;
			this.width = 0;
			this.height = 0;
		},

		onMapRecived: function (data) {
			this.layers = data.layers;
			this.width = data.width;
			this.height = data.height;
			//this.w = 960;
			//this.h = 576;
			this.loadtilesets(data.tilesets);
		},

		getTileSet: function (tileIndex) {
			for (var i = 0; i < this.tilesets.length; i++) {
				if (this.tilesets[i].firstgid < tileIndex) return this.tilesets[i];
			}
		},

		loadtilesets: function (tilesets) {
			var countTileSets = tilesets.length,
				self = this;
			_.each(tilesets, function (tileset) {
				var image = new Image();
				image.src = "img/sprites/ground_64x64.png";
				image.onload = function () {
					countTileSets--;
					if (countTileSets === 0) {
						self.isloaded = true;
					}
				};

				self.tilesets.push({
					firstgid: tileset.firstgid,
					tileWidth: tileset.tilewidth,
					tileHeight: tileset.tileheight,
					width: tileset.imagewidth / tileset.tilewidth,
					image: image
				});
			});
		}
	});
	return Map;
});