define(['entities/entity'], function (Entity) {

	var Bullet = Entity.extend({
		init: function (id) {
			this._super(id, "bullet");
            this.loadAnimations("bullet");
		}
	});

	return Bullet;
});