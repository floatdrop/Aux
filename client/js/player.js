define(['entity'], function (Entity) {

	var Player = Entity.extend({
		init: function (id) {
			this._super(id, Constants.Types.Entities.PLAYER);
		},

		update: function (entity_info) {
			this._super(entity_info);
			this.setAnimation(entity_info.animation);
			this.setAngle(entity_info.angle);
		}
	});

	return Player;
});
