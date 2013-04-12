/* global _ */

define(['camera'], function (Camera) {
	var Renderer = Class.extend({
		init: function (game, canvas) {
			this.scale = 100;
			this.game = game;
			this.canvas = canvas;
			this.context = (canvas && canvas.getContext) ? canvas.getContext("2d") : null;
			this.camera = new Camera(this);
		},
		renderFrame: function () {
			this.clearScreen(this.context);
			this.camera.updatePosition(this.context);
			this.drawMap(this.game.map);
			var self = this,
				entities = _.sortBy(this.game.entities, function (e) {
					//Draw debugEntity after Entity
					if (e.id.toString().indexOf("debug") === 0) {
						return e.y + 1;
					}
					return e.y;
				});
			_.each(entities, function (entity) {
				entity.draw(self.context);
			});
		},
		clearScreen: function (ctx) {
			ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		},
		drawMap: function (map) {
			var self = this,
				visibleArea = this.camera.getVisibleArea();

			_.each(map.layers, function (layer) {
				if (layer.visible) self.drawLayer(map, layer, visibleArea);
			});
		},
		drawLayer: function (map, layer, visibleArea) {
			var self = this,
				indexY = visibleArea.startY,
				tile = null,
				i = 0,
				tileIndex = 0;

			while (indexY < visibleArea.endY) {
				i = visibleArea.startX;
				while (i < visibleArea.endX) {
					tileIndex = indexY * map.countTileInRow + i;
					tile = layer.data[tileIndex];
					if (tile !== 0) {
						self.drawTile(map, tileIndex, tile);
					}
					i++;
				}
				indexY++;
			}
		},

		drawTile: function (map, index, value) {
			var tileSet = map.getTileSet(value),
				tileW = tileSet.tileWidth,
				tileH = tileSet.tileHeight,
				x = ((value - 1) % tileSet.width) * tileW,
				y = Math.floor(value / tileSet.width) * tileH,
				dx = (index % map.countTileInRow) * tileW,
				dy = Math.floor(index / map.countTileInRow) * tileH;

			this.context.drawImage(tileSet.image, x, y, tileW, tileH, dx, dy, tileW, tileH);
		}
	});
	return Renderer;
});