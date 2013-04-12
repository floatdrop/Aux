define([], function () {

	var Entity = Class.extend({
		init: function (id, kind) {
			this.id = id;
			this.kind = kind;
			this.x = 0;
			this.y = 0;
			this.sprite = null;
			this.flipSpriteX = false;
			this.flipSpriteY = false;
			this.animations = null;
			this.currentAnimation = null;
			this.scale = 100;
		},
		setPosition: function (x, y) {
			this.x = x;
			this.y = y;
		},
		setAngle: function (a) {
			this.angle = a;
		},
		update: function (entity_info) {
			this.setPosition(entity_info.position.x, entity_info.position.y);
		},
		isDebug: function () {
			return this.id.toString().indexOf("debug") === 0;
		},
		draw: function (context) {
			var os = 1,
			ds = 1,
			frame = this.currentAnimation.currentFrame,
			x = frame.x * os,
			y = frame.y * os,
			w = this.sprite.width * os,
			h = this.sprite.height * os,
			ox = this.sprite.offsetX * 1,
			oy = this.sprite.offsetY * 1,
			dx = this.x * this.scale - this.sprite.width / 2,
			dy = this.y * this.scale - this.sprite.height / 2,
			dw = w * ds,
			dh = h * ds;

			context.save();
			if (this.currentAnimation) {
				context.translate(this.currentAnimation.offset_x, this.currentAnimation.offset_y);
			}
			if (this.currentAnimation.flipSpriteX) {
				context.translate(dx + dw / 2, dy);
				context.scale(-1, 1);
			}
			else if (this.currentAnimation.flipSpriteY) {
				context.translate(dx, dy + dh);
				context.scale(1, -1);
			}
			else {
				context.translate(dx, dy);
			}

			context.drawImage(this.sprite.image, x, y, w, h, ox, oy, dw, dh);

			context.restore();
		},
		setSprite: function (sprite) {
			if (!sprite) {
				console.log(this.id + " : sprite is null", true);
				throw "Error";
			}
			if (this.sprite && this.sprite.name === sprite.name) {
				return;
			}
			this.sprite = sprite;
			this.animations = sprite.createAnimations();
			this.isLoaded = true;
		},
		getAnimationByName: function (name) {
			var animation = null;

			if (name in this.animations) {
				animation = this.animations[name];
			} else {
				console.log("No animation called " + name);
			}
			return animation;
		},
		idle: function () {

		},
		setAnimation: function (name, count, onEndCount) {
			var self = this;

			if (this.isLoaded) {
				if (this.currentAnimation && this.currentAnimation.name === name) {
					return;
				}

				var a = this.getAnimationByName(name);

				if (a) {
					this.currentAnimation = a;
					if (name.substr(0, 3) === "atk") {
						this.currentAnimation.reset();
					}
					this.currentAnimation.setCount(count ? count : 0, onEndCount || function () {
						self.idle();
					});
				}
			} else {
				console.log("Not ready for animation");
			}
		}
	});

	return Entity;
});