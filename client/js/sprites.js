/* global _ */

define(['./lib/text!../sprites/player.json',
	'./lib/text!../sprites/atlas.json'], function () {

	var Sprites = { definitions: {} };

	_.each(arguments, function (spriteJson) {
		var sprite = JSON.parse(spriteJson);
		var defs = sprite.isAtlas ? getAtlasDefs(sprite) : getBasicDef(sprite);
		_.each(defs, function (def) {
			addAnimations(def);
			Sprites.definitions[def.id] = def;
		});
	});

	function getBasicDef(sprite) {
		var def = {
			id: sprite.id, 
			width: sprite.width,
			height: sprite.height,
			baseTexture: PIXI.Texture.fromImage(sprite.image).baseTexture,
			animations: sprite.animations,
			offset: new PIXI.Point(sprite.offset_x, sprite.offset_y),
			anchor: new PIXI.Point(sprite.anchor_x || 0.5, sprite.anchor_y || 0.5)
		};
		return [def];
	}

	function getAtlasDefs(sprites) {
		var image = sprites.meta.image,
			defs = [];
		_.each(sprites.frames, function (sprite, imageName) {
			var offset_x = (sprite.offset_x || 0) + sprite.frame.x,
				offset_y = (sprite.offset_y || 0) + sprite.frame.y,
				def = {
					id: getNameWithoutExtension(imageName),
					width: sprite.frame.w,
					height: sprite.frame.h,
					baseTexture: PIXI.Texture.fromImage(image).baseTexture,
					animations: { "default": {} },
					offset: new PIXI.Point(offset_x, offset_y),
					anchor: new PIXI.Point(sprite.anchor_x || 0.5, sprite.anchor_y || 0.5)
				};
			defs.push(def);
		});
		return defs;
	}

	function getNameWithoutExtension(name) {
		return name.substr(0, name.lastIndexOf('.'));
	}

	function addAnimations(def) {
		_.each(def.animations, function (animation, name) {
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
	}

	return Sprites;

});