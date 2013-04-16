define(['entities/entity'], function (Entity) {

	var Player = Entity.extend({
		init: function (id) {
			this._super(id, "player");
		}
	});

	return Player;
});
