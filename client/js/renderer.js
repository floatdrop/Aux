/* global _ */

define([], function () {
	var Renderer = Class.extend({
		init: function (game, canvas) {
			this.debug = false;
			this.scale = 100;
			this.game = game;
			this.canvas = canvas;
			this.context = (canvas && canvas.getContext) ? canvas.getContext("2d") : null;
		},
		renderFrame: function () {
			this.clearScreen(this.context);
			this.drawMap(this.game.map);
			var self = this,
				entities = _.sortBy(this.game.entities, function (e) {
					return e.y;
				});
			_.each(entities, function (entity) {
				entity.draw(self.context);
			});
		},
		clearScreen: function (ctx) {
			ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		},
		debugDrawEntity: function (entity) {
			var x = entity.position.x * this.scale,
				y = entity.position.y * this.scale,
				width = entity.width * this.scale,
				heigth = entity.heigth * this.scale,
				ctx = this.context;
			ctx.fillStyle = "rgb(0, 0, 0)";
			ctx.fillRect(x - width / 2, y - heigth / 2, width, heigth);
			ctx.fillStyle = "rgb(255, 0, 0)";
			ctx.fillText(entity.type, x, y);
		},
		drawMap: function (map) {
			var self = this;
			_.each(map.layers, function (layer) {
				if (layer.visible) self.drawLayer(map, layer);
			});
		},
		drawLayer: function (map, layer) {
			var self = this,
				i = 0;
			_.each(layer.data, function (tile) {
				if (tile !== 0) self.drawTile(map, i, tile);
				i++;
			});
		},
		drawTile: function (map, index, value) {
			var tileSet = map.getTileSet(value),
				tileW = tileSet.tileWidth,
				tileH = tileSet.tileHeight,
				x = ((value - 1) % tileSet.width) * tileW,
				y = Math.floor(value / tileSet.width) * tileH,
				dx = (index % map.width) * tileW,
				dy = Math.floor(index / map.width) * tileH;

			this.context.drawImage(tileSet.image, x, y, tileW, tileH, dx, dy, tileW, tileH);
		}
	});
	return Renderer;
});