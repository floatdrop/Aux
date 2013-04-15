define([], function () {
	var Camera = Class.extend({
		init: function (renderer) {
			this.renderer = renderer;
			this.map = renderer.game.map;
			this.linkedEntity = null;
			this.center = {x: this.renderer.canvas.width / 2, y: this.renderer.canvas.height / 2};
			this.countAdditionalTiles = 5; // draw tiles with reserve
		},

		linkToEntity: function (entity) {
			this.linkedEntity = entity;
			this.oldPosition = {x: entity.x, y: entity.y};
		},

		getVisibleArea: function () {
			if (this.linkedEntity === null) {
				return this.getVisibleAreaStructure(0, 0, 0, 0);
			}

			var pos =  this.linkedEntity.getPosition(),
				x = pos.x * this.renderer.scale,
				y = pos.y * this.renderer.scale,
				startX = Math.floor((x - this.center.x) / this.map.tileWidth),
				startY = Math.floor((y - this.center.y) / this.map.tileHeight),
				maxTileInRow = Math.floor(this.center.x * 2 / this.map.tileWidth) + this.countAdditionalTiles,
				maxTileInCol = Math.floor(this.center.y * 2 / this.map.tileHeight) + this.countAdditionalTiles,
				endX = startX + maxTileInRow,
				endY = startY + maxTileInCol;

			if (startX > this.countAdditionalTiles) {
				startX -= this.countAdditionalTiles;
			}
			if (startY > this.countAdditionalTiles) {
				startY -= this.countAdditionalTiles;
			}

			if (startX < 0) {
				startX = 0;
				endX = maxTileInRow;
			}
			if (endX > this.map.countTileInRow) {
				endX = this.map.countTileInRow;
				startX = endX - maxTileInRow;
				if (startX < 0) {
					startX = 0;
				}
			}

			if (startY < 0) {
				startY = 0;
				endY = maxTileInCol;
			}
			if (endY > this.map.countTileInCol) {
				endY = this.map.countTileInCol;
				startY = endY - maxTileInCol;
				if (startY < 0) {
					startY = 0;
				}
			}

			return this.getVisibleAreaStructure(startX, endX, startY, endY);
		},

		getVisibleAreaStructure: function (startX, endX, startY, endY) {
			return {
				startX: startX,
				endX: endX,
				startY: startY,
				endY: endY
			};
		},

		isVisible: function (entity) {
			if (this.linkedEntity === null) {
				return false;
			}

			var pos = this.linkedEntity.getPosition(),
				entity_pos = entity.getPosition(),
				x = pos.x * this.renderer.scale,
				y = pos.y * this.renderer.scale,
				x1 = entity_pos.x * this.renderer.scale,
				y1 = entity_pos.y * this.renderer.scale,
				leftX = x - this.center.x,
				leftY = y - this.center.y,
				rightX = x + this.center.x,
				rightY = y + this.center.y;

			if (leftX < 0) {
				rightX = this.center.x * 2;
			}
			if (rightX > this.map.width) {
				leftX = rightX - this.center.x * 2;
			}

			if (leftY < 0) {
				rightY = this.center.y * 2;
			}
			if (rightY > this.map.height) {
				leftY = rightY - this.center.y * 2;
			}

			leftX -= entity.sprite.width;
			rightX += entity.sprite.width;
			leftY -= entity.sprite.height;
			rightY += entity.sprite.height;

			return x1 >= leftX && x1 <= rightX && y1 >= leftY && y1 <= rightY;
		},

		updatePosition: function (context) {
			if (this.linkedEntity) {
				var pos =  this.linkedEntity.getPosition(),
					x = pos.x * this.renderer.scale,
					y = pos.y * this.renderer.scale,
					offset_x = x - this.oldPosition.x,
					offset_y = y - this.oldPosition.y;

				if (x - this.center.x < 0 || this.map.width - x < this.center.x) {
					offset_x = 0;
				}
				if (y - this.center.y < 0 || this.map.height - y < this.center.y) {
					offset_y = 0;
				}

				context.translate(-offset_x, -offset_y);
				this.oldPosition = {x: x, y: y};
			}
		}
	});

	return Camera;
});