define(function () {

	var Animation = Class.extend({
		init: function (name, length, row, width, height, flipX, flipY, speed, offset, offset_x, offset_y) {
			this.name = name;
			this.length = length;
			this.row = row;
			this.width = width;
			this.height = height;
			this.speed = speed;
			this.flipSpriteX = flipX;
			this.flipSpriteY = flipY;
			this.offset = offset;
			if (this.offset){
				this.offset_x = (offset_x !== undefined) ? offset_x : 0;
				this.offset_y = (offset_y !== undefined) ? offset_y : 0;
			}
			this.reset();
		},

		tick: function () {
			var i = this.currentFrame.index;

			i = (i < this.length - 1) ? i + 1 : 0;

			if (this.count > 0) {
				if (i === 0) {
					this.count -= 1;
					if (this.count === 0) {
						this.currentFrame.index = 0;
						this.endcount_callback();
						return;
					}
				}
			}

			this.currentFrame.x = this.width * i;
			this.currentFrame.y = this.height * this.row;
			this.currentFrame.index = i;
		},

		setCount: function (count, onEndCount) {
			this.count = count;
			this.endcount_callback = onEndCount;
		},

		isTimeToAnimate: function (time) {
			return (time - this.lastTime) > this.speed;
		},

		update: function (time) {
			if (this.lastTime === 0 && this.name.substr(0, 3) === "atk") {
				this.lastTime = time;
			}

			if (this.isTimeToAnimate(time)) {
				this.lastTime = time;
				this.tick();
				return true;
			} else {
				return false;
			}
		},

		reset: function () {
			this.lastTime = 0;
			this.currentFrame = {
				index: 0,
				x: 0,
				y: this.row * this.height
			};
		}
	});

	return Animation;
});