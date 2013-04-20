define(['entities/debugEntity'], function (DebugEntity) {

    var CircleEntity = DebugEntity.extend({
        radius: 0,
        
        init: function (id) {
            this._super(id, Constants.Types.Entities.CircleEntity);
        },

        update: function (entity_info) {
            this.setPosition(entity_info.position.x, entity_info.position.y);
            this.radius = entity_info.radius * 100;
        },

        draw: function (context) {
            var position = this.getPosition();
            context.beginPath();
            context.arc(position.x, position.y, this.radius, 0, Math.PI * 2, true);
            context.closePath();
            context.fill();
        }
    });

    return CircleEntity;
});