define(['entity'], function (Entity) {

	var Player = Entity.extend({
		init: function (id) {
			this._super(id, Constants.Types.Entities.PLAYER);
		}
	});

	return Player;
});
