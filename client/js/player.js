define(['player', 'entity', 'sprite'], function(Player, Entity, Sprite) {
    
    var Player = Entity.extend({
        init: function(id, name) {
            this._super(id, Types.Entities.PLAYER);
            this.name = name;
            this.setSprite(new Sprite("player", 1));
            this.setAnimation("idle_right");
        }
    });
    
    return Player;
});