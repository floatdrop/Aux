define(['entity'], function (Entity) {

    var CircleEntity = Entity.extend({
        init: function (entity_info) {
            this._super(entity_info.id, Constants.Types.Entities.CircleEntity);
            this.name = "CircleEntity";
            this.radius = 0;
        },

        update: function (entity_info) {
            this.setPosition(entity_info.position.x, entity_info.position.y);
            this.radius = entity_info.radius;
        },

        draw: function (context) {
            var x = this.x * this.scale,
                y = this.y * this.scale,
                radius = this.radius * this.scale;

            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2, true);
            context.closePath();
            context.fill();
        }
    });

    return CircleEntity;
});