define(['text!../sprites/player.json'
        ], function() {
    
    var sprites = {};
    
    _.each(arguments, function(spriteJson) {
        var sprite = JSON.parse(spriteJson);
        
        sprites[sprite.id] = sprite;
    });
    
    return sprites;
});