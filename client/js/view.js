define([], function () {

	var View = function (width, height, max_x, max_y) {

		PIXI.DisplayObjectContainer.call(this);

		this.width = width;
		this.height = height;
		this.max = {
			x: max_x,
			y: max_y
		};
		this.linkedEntity = null;
		this.center = {
			x: (this.width / 2) | 0,
			y: (this.height / 2) | 0
		};
	};

	View.constructor = View;
	View.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

	View.prototype.linkToEntity = function (entity) {
		this.linkedEntity = entity;
	};

	View.prototype.setLimits = function (x, y) {
		this.max.x = x;
		this.max.y = y;
	};

	View.prototype.update = function () {
		if (this.linkedEntity) {
			var pos = this.linkedEntity.getPosition(),
				x = pos.x,
				y = pos.y,
				offset_x = x - this.center.x,
				offset_y = y - this.center.y;

			if (offset_x < 0)
				offset_x = 0;
			if (offset_x > this.max.x)
				offset_x = this.max.x;
			if (offset_y < 0)
				offset_y = 0;
			if (offset_y > this.max.y)
				offset_y = this.max.y;


			this.position = new PIXI.Point(-offset_x, -offset_y);
		}
	};

	return View;
});