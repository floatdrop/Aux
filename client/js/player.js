define(['entity', 'sprite'], function(Entity, Sprite) {

    var Player = Entity.extend({
        init: function(id, name) {
            this._super(id, Constants.Types.Entities.PLAYER);
            this.name = name;
            this.setSprite(new Sprite("player", 1));
            this.setAnimation("idle_right", 100);
        }
    });

    return Player;
});