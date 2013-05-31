/* global _ */

define(['sprites'], function (Sprites) {

	var Entity = LINK.MovieClipManager.extend({
		init: function (id, kind) {
			this.id = id;
			this.kind = kind;
			this.layer = "default";
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
				movieclip.loop = adef.loop;
				self.add(name, movieclip).play();
			});
		},
		update: function (entity_info) {
			this.set(entity_info.animation || "default").play();
			this.position = entity_info.position;
			this.rotate = entity_info.angle;
		}
	});

	return Entity;
});