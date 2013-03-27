define(['entity', 'sprite'], function(Entity, Sprite) {
    
    var SimpleGameObject = Entity.extend({
        init: function(id, name) {
            this._super(id, name);
            this.name = name;
            this.setSprite(new Sprite(name, 1));
			this.setAnimation("basic", 100);
        }
    });
    
    return SimpleGameObject;
});