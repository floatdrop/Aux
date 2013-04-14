define(['entities/entity'], function (Entity) {

    var CircleEntity = Entity.extend({
        init: function (id) {
            this._super(id, Constants.Types.Entities.CircleEntity);
        },

        update: function (entity_info) {
            this.setPosition(entity_info.position.x, entity_info.position.y);
            this.radius = entity_info.radius;
        },

        draw: function (context) {
            var x = this.position.x * this.scale,
                y = this.position.y * this.scale,
                radius = this.radius * this.scale;

            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2, true);
            context.closePath();
            context.fill();
        }
    });

    return CircleEntity;
});