define(['entity', 'sprite'], function(Entity, Sprite) {

    var CircleEntity = Entity.extend({
        init: function(id, name) {
            this._super(id, name);
            this.name = name;
        },

        update: function(entity_info){

        },

        draw: function(context){
            context.beginPath();
            context.arc(this.x, this.y, 40, 40, Math.PI*2, true);
            context.closePath();
            context.fill();
        }
    });

    return CircleEntity;
});