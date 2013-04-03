define(['./lib/text!../sprites/player.json',
	'./lib/text!../sprites/trie.json',
	'./lib/text!../sprites/stone.json',
	'./lib/text!../sprites/stone2.json',
	'./lib/text!../sprites/stone3.json',
	'./lib/text!../sprites/stone4.json',
	'./lib/text!../sprites/stump.json',
	'./lib/text!../sprites/empty.json', ], function () {

	var sprites = {};

	_.each(arguments, function (spriteJson) {
		var sprite = JSON.parse(spriteJson);
		sprites[sprite.id] = sprite;
	});

	return sprites;

});