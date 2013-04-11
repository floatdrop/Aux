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
	'./lib/text!../sprites/well.json'], function () {

	var sprites = {};

	_.each(arguments, function (spriteJson) {
		var sprite = JSON.parse(spriteJson);
		sprites[sprite.id] = sprite;
	});

	return sprites;

});