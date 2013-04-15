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
			anchor: new PIXI.Point(sprite.anchor_x, sprite.anchor_y)
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
		if (animation !== entity.animation) {
			var def = Sprites.definitions[sprite];
			var adef = def.animations[animation];
			if (entity.movieclip instanceof PIXI.MovieClip) {
				entity.movieclip.textures = adef.textures;
				entity.movieclip.setTexture(adef.textures[0]);
			} else {
				entity.movieclip = new PIXI.MovieClip(adef.textures);
				entity.animated = true;
			}
			entity.movieclip.animationSpeed = adef.speed;
			entity.movieclip.scale = adef.scale;
			entity.movieclip.anchor = def.anchor;
			entity.movieclip.play();
			entity.animation = animation;
		} else {
			entity.animated = false;
		}
	};

	return Sprites;

});