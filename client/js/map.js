define([], function() {
	var Map = Class.extend({
		init: function(game) {
			this.isLoaded = false;
			this.tiles = [];
            this.game = game;
		},

		onMapLoaded: function(data){
			this.data = data;
			this.width = data.width;
			this.loadTilesets();
		},

		loadTilesets: function(){
			var self = this;
			var countTiles = this.data.tilesets.length;

			for (var i=0;i<countTiles;i++){
				var tile = this.data.tilesets[i];
				var tileWidth = tile.tilewidth;
				var tileHeight = tile.tileheight;
				var width = tile.imagewidth;
				var height = tile.imageheight;

				var image = new Image();
				image.src = "img/sprites/ground_64x64.png";
				image.onload = function() {
					countTiles--;
					if (countTiles == 0){
						self.isLoaded = true;
					}
				}
				this.tiles.push({width:width / tileWidth, tileWidth:tileWidth, tileHeight:tileHeight, image:image});
			}
		},

		draw: function(canvas){
		}
	});
	return Map;
});