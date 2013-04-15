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
			this.countTileInRow = 0;
			this.countTileInCol = 0;
			this.tileWidth = 0;
			this.tileHeight = 0;
		},

		onMapRecived: function (data) {
			this.layers = data.layers;
			this.countTileInRow = data.width;
			this.countTileInCol = data.height;
			this.tileWidth = data.tilewidth;
			this.tileHeight = data.tileheight;
			this.width = data.width * data.tilewidth;
			this.height = data.height * data.tileheight;
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