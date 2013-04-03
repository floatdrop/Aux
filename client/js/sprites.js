define(['lib/underscore',
	'./lib/text!../sprites/player.json',
	'./lib/text!../sprites/trie.json',
	'./lib/text!../sprites/stone.json',
	'./lib/text!../sprites/stone2.json',
	'./lib/text!../sprites/stone3.json',
	'./lib/text!../sprites/stone4.json',
	'./lib/text!../sprites/stump.json',
	'./lib/text!../sprites/empty.json'], function (_) {

	var sprites = {};

	var args = arguments.splice(1, 1);

	_.each(args, function (spriteJson) {
		var sprite = JSON.parse(spriteJson);
		sprites[sprite.id] = sprite;
	});

	return sprites;

});