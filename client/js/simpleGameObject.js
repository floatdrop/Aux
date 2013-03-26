define(['entity', 'sprite'], function(Entity, Sprite) {
    
    var SimpleGameObject = Entity.extend({
        init: function(id, name, type) {
            this._super(id, type);
            this.name = name;
            this.setSprite(new Sprite(name, 1));
        }
    });
    
    return SimpleGameObject;
});