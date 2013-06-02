var DebugEntity = require('debugEntity');

module.exports = DebugEntity.extend({
    points: [],

    initialize: function (id) {
        this.supr(id, Constants.Types.Entities.PolygonEntity);
    },

    update: function (entity_info) {
        this.position = new PIXI.Point(entity_info.position.x, entity_info.position.y);
        this.points = _.map(entity_info.points, function (point) {
            return {
                x: point.x * 100,
                y: point.y * 100
            };
        });
    },

    /* this should be overwriting renderCanvas and renderWebgl methods, if they were acessable in PIXI */
    draw: function (context) {
        var x = this.position.x,
            y = this.position.y;

        context.beginPath();
        for (var i = 0; i < this.points.length; i++) {
            var x1 = this.points[i].x + x,
                y1 = this.points[i].y + y;

            context.lineTo(x1, y1);
        }
        context.closePath();
        context.fill();
    }
});