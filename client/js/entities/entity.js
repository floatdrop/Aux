var Sprites = require('sprites');

var DisplayObjectContainer = klass(PIXI.DisplayObjectContainer.prototype);

module.exports = DisplayObjectContainer.extend({
	initialize: function (id, kind) {
		PIXI.DisplayObjectContainer.call(this);
		this.id = id;
		this.kind = kind;
		this.layer = "default";
		this.animation = new LINK.MovieClipManager();
		this.addChild(this.animation);
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
			self.animation.add(name, movieclip).play();
		});
	},
	update: function (entity_info) {
		this.animation.set(entity_info.animation || "default").play();
		this.position = new PIXI.Point(entity_info.position.x, entity_info.position.y);
		this.rotation = entity_info.angle;
	}
});