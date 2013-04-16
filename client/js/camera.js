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