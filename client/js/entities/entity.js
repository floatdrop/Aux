/* global _ */

define(['sprites'], function (Sprites) {

	var Entity = Class.extend({
		init: function (id, kind) {
			this.id = id;
			this.kind = kind;
			this.animation = new LINK.MovieClipManager();
			this.layer = "default";
		},
		getDisplayObject: function () {
			return this.animation;
		},
		getPosition: function () {
			return this.animation.position;
		},
		setPosition: function (x, y) {
			this.animation.position.x = x | 0;
			this.animation.position.y = y | 0;
		},
		getAngle: function () {
			return this.animation.rotation;
		},
		setAngle: function () {
			// this.movieclip.rotation = a;
		},
		loadAnimations: function (sprite) {
			var self = this;
			var def = Sprites.definitions[sprite];
			_.each(def.animations, function (adef, name) {
				var movieclip = new PIXI.MovieClip(adef.textures);
				movieclip.position = def.offset;
				movieclip.animationSpeed = adef.speed;
				movieclip.scale = adef.scale;
				movieclip.anchor = def.anchor;
				self.animation.add(name, movieclip).play();
			});
		},
		update: function (entity_info) {
			this.animation.set(entity_info.animation || "default").play();
			this.setPosition(entity_info.position.x, entity_info.position.y);
			this.setAngle(entity_info.angle);
		}
	});

	return Entity;
});