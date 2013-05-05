define(['entities/entity'], function (Entity) {

	var Player = Entity.extend({
		init: function (id) {
			this._super(id, "player");
            this.loadAnimations("player");
		}
	});

	return Player;
});
