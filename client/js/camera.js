define([], function () {
	var Camera = Class.extend({
		init: function (renderer) {
			this.renderer = renderer;
			this.game = renderer.game;
			this.linkedEntity = null;
			this.center = {x: window.innerWidth / 2, y: window.innerHeight / 2};
			this.position = {x: 0, y: 0};
		},

		linkToEntity: function (entity) {
			this.linkedEntity = entity;
			this.oldPosition = {x: entity.x, y: entity.y};
		},

		updatePosition: function (context) {
			if (this.linkedEntity){
				var x = this.linkedEntity.x * 100,
					y = this.linkedEntity.y * 100,
					offset_x = x - this.oldPosition.x,
					offset_y = y - this.oldPosition.y;

				if (x - this.center.x < 0) {
					offset_x = 0;
				}
				if (y - this.center.y < 0) {
					offset_y = 0;
				}

				context.translate(-offset_x, -offset_y);
				this.oldPosition = {x: x, y: y};
			}
		}
	});

	return Camera;
});