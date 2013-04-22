/* global _ */

define(['entities/debugEntity'], function (DebugEntity) {

    var PolygonEntity = DebugEntity.extend({
        points: [],

        init: function (id) {
            this._super(id, Constants.Types.Entities.PolygonEntity);
        },

        update: function (entity_info) {
            this.setPosition(entity_info.position.x, entity_info.position.y);
            this.points = _.map(entity_info.points, function (point) {
                return { x: point.x * 100, y: point.y * 100 };
            });
        },

        draw: function (context) {
            var position = this.getPosition();
            var x = position.x,
                y = position.y;

            context.beginPath();
            for (var i = 0; i < this.points.length;i++) {
                var x1 = this.points[i].x + x,
                    y1 = this.points[i].y + y;

                context.lineTo(x1, y1);
            }
            context.closePath();
            context.fill();
        },
    });

    return PolygonEntity;
});