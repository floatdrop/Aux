/* global _ */

define(['./lib/text!../sprites/player.json',
	'./lib/text!../sprites/tree.json',
	'./lib/text!../sprites/stone.json'], function () {

	var Sprites = { definitions: {} };

	_.each(arguments, function (spriteJson) {
		var sprite = JSON.parse(spriteJson);
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
				row: animation.row,
				scale: new PIXI.Point(animation.scalex || 1, animation.scaley || 1),
				speed: animation.speed,
				position: new PIXI.Point(animation.offsetx || def.offsetx, animation.offsety || def.offsety),
				textures: []
			};
			for (var i = 0; i < adef.length; i++) {
				adef.textures.push(new PIXI.Texture(def.baseTexture, 
					new PIXI.Rectangle(i * def.width, adef.row * def.height, def.width, def.height)));
			}
			def.animations[name] = adef;
		});
		Sprites.definitions[sprite.id] = def;
	});

	return Sprites;

});