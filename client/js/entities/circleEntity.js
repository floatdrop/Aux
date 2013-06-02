var DebugEntity = require('debugEntity');

module.exports = DebugEntity.extend({
    radius: 0,

    initialize: function (id) {
        this.supr(id, Constants.Types.Entities.CircleEntity);
    },

    update: function (entity_info) {
        this.position = entity_info.position;
        this.radius = entity_info.radius;
    },

    draw: function (context) {
        context.beginPath();
        context.arc(this.worldtransform[2], this.worldtransform[5], this.radius, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
    }
});