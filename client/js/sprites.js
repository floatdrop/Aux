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
			offsetx: sprite.offsetx || 0,
			offsety: sprite.offsety || 0,
			animations: {}
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

	Sprites.ApplyAnimation = function (entity, sprite, animation) {
		if (sprite === undefined || animation === undefined)
			return;
		var adef = Sprites.definitions[sprite].animations[animation];
		var movieclip = new PIXI.MovieClip(adef.textures);
		movieclip.animationSpeed = adef.speed;
		movieclip.scale = adef.scale;
		entity.movieclip = movieclip;
		entity.animated = true;
	};

	return Sprites;

});