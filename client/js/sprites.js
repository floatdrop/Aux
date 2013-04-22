/* global _ */

define(['./lib/text!../sprites/player.json',
	'./lib/text!../sprites/tree.json',
	'./lib/text!../sprites/stone.json',
	'./lib/text!../sprites/stone2.json',
	'./lib/text!../sprites/stone3.json',
	'./lib/text!../sprites/stone4.json',
	'./lib/text!../sprites/stump.json',
	'./lib/text!../sprites/empty.json',
	'./lib/text!../sprites/pillar.json',
	'./lib/text!../sprites/pillar2.json',
	'./lib/text!../sprites/signpost.json',
	'./lib/text!../sprites/stone5.json',
	'./lib/text!../sprites/stone6.json',
	'./lib/text!../sprites/well.json',
	'./lib/text!../sprites/bullet.json'], function () {

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
				row: animation.row || 0,
				scale: new PIXI.Point(animation.scale_x || 1, animation.scale_y || 1),
				speed: animation.speed || 0,
				textures: []
			};
			for (var i = 0; i < (adef.length || 1); i++) {
				adef.textures.push(new PIXI.Texture(def.baseTexture, 
					new PIXI.Rectangle(i * def.width, (adef.row || 0) * def.height, def.width, def.height)));
			}
			def.animations[name] = adef;
		});
		Sprites.definitions[sprite.id] = def;
	});

	return Sprites;

});