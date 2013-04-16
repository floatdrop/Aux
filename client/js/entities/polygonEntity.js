define(['entities/entity'], function (Entity) {

    var PolygonEntity = Entity.extend({
        points: [],

        init: function (id) {
            this._super(id, Constants.Types.Entities.PolygonEntity);
        },

        update: function (entity_info) {
            this.setPosition(entity_info.position.x, entity_info.position.y);
            this.points = entity_info.points;
        },

        draw: function (context) {
            var x = this.position.x * this.scale,
                y = this.position.y * this.scale;

            context.beginPath();
            for (var i = 0; i < this.points.length;i++) {
                var x1 = this.points[i].x * this.scale + x,
                    y1 = this.points[i].y * this.scale + y;

                context.lineTo(x1, y1);
            }
            context.closePath();
            context.fill();
        },
    });

    return PolygonEntity;
});