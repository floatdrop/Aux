define(['entity'], function (Entity) {

    var PolygonEntity = Entity.extend({
        init: function (id) {
            this._super(id, Constants.Types.Entities.PolygonEntity);
        },

        update: function (entity_info) {
            this.setPosition(entity_info.position.x, entity_info.position.y);
            this.vertices = entity_info.vertices;
        },

        draw: function (context) {
            var x = this.x * this.scale,
                y = this.y * this.scale;

            context.beginPath();
            for (var i = 0; i < this.vertices.length;i++) {
                var x1 = this.vertices[i].x * this.scale + x,
                    y1 = this.vertices[i].y * this.scale + y;

                context.lineTo(x1, y1);
            }
            context.closePath();
            context.fill();
        },
    });

    return PolygonEntity;
});