define(['player', 'entity'], function(Player, Entity) {
    
    var Player = Entity.extend({
        init: function(id, name) {
            this._super(id, Types.Entities.PLAYER);

            this.name = name;
            this.spriteName = "player";
        }
    });
    
    return Player;
});