define(['text!../sprites/player.json',
        'text!../sprites/trie.json',
		'text!../sprites/stone.json',
		'text!../sprites/stone2.json',
		'text!../sprites/stone3.json',
		'text!../sprites/stone4.json',
		'text!../sprites/stump.json'], function() {

    var sprites = {};
    
    _.each(arguments, function(spriteJson) {
        var sprite = JSON.parse(spriteJson);
        sprites[sprite.id] = sprite;
    });

    return sprites;

});