/* global _ */

define(['./lib/json!../sprites/player.json',
	'./lib/json!../sprites/tree.json',
	'./lib/json!../sprites/stone.json',
	'./lib/json!../sprites/stone2.json',
	'./lib/json!../sprites/stone3.json',
	'./lib/json!../sprites/stone4.json',
	'./lib/json!../sprites/stump.json',
	'./lib/json!../sprites/empty.json',
	'./lib/json!../sprites/pillar.json',
	'./lib/json!../sprites/pillar2.json',
	'./lib/json!../sprites/signpost.json',
	'./lib/json!../sprites/stone5.json',
	'./lib/json!../sprites/stone6.json',
	'./lib/json!../sprites/well.json',
	'./lib/json!../sprites/bullet.json'], function () {

	var Sprites = { definitions: {} };

	_.each(arguments, function (sprite) {
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

	return Sprites;

});