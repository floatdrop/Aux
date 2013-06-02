var sprites = [require('sprites/player'), require('sprites/bullet')];

var Sprites = { definitions: {} };

_.each(sprites, function (sprite) {
	var def = { 
		width: sprite.width,
		height: sprite.height,
		baseTexture: PIXI.Texture.fromImage(sprite.image).baseTexture,
		animations: {},
		offset: new PIXI.Point(sprite.offset_x, sprite.offset_y),
		anchor: new PIXI.Point(sprite.anchor_x || 0.5, sprite.anchor_y || 0.5)
	};
	_.each(sprite.animations, function (animation, name) {
		var adef = {
			length: animation.length,
			x: animation.x || 0,
			y: animation.y || 0,
			loop: animation.loop === undefined ? true : animation.loop,
			scale: new PIXI.Point(animation.scale_x || 1, animation.scale_y || 1),
			speed: animation.speed || 0,
			textures: []
		};
		for (var i = 0; i < (adef.length || 1); i++) {
			adef.textures.push(new PIXI.Texture(def.baseTexture, 
				new PIXI.Rectangle(i * def.width + adef.x, adef.y, def.width, def.height)));
		}
		def.animations[name] = adef;
	});
	Sprites.definitions[sprite.id] = def;
});

module.exports = Sprites;