define(function () {
	var TileSet = Class.extend({
		init: function (tileset_info) {
			this.baseTexture = PIXI.Texture.fromImage(tileset_info.image).baseTexture;
			this.imagewidth = tileset_info.imagewidth;
			this.imageheight = tileset_info.imageheight;
			this.name = tileset_info.name;
			this.tilewidth = tileset_info.tilewidth;
			this.tileheight = tileset_info.tileheight;
			this.firstindex = tileset_info.firstgid;
			this.tilecount = this.imagewidth * this.imageheight / (this.tilewidth * this.tileheight);
			this.tilecache = new Array(this.tilecount);
			this.lastindex = this.tilecount + this.firstindex;
			this.width = this.imagewidth / this.tilewidth;
			this.height = this.imageheight / this.tileheight;
		},

		getTexture: function (index) {
			if (this.tilecache[index]) {
				return this.tilecache[index];
			}
			var i = index - this.firstindex;
			var frame = new PIXI.Rectangle(
				((i % this.width) | 0) * this.tilewidth, 
				((i / this.width) | 0) * this.tileheight, 
				this.tilewidth, 
				this.tileheight);
			this.tilecache[index] = new PIXI.Texture(this.baseTexture, frame);
			return this.tilecache[index];
		}
	});

	return TileSet;
});