define(['entities/entity'], function (Entity) {

	var GLOBAL_ID_COUNTER = 0;

	var TrajectoryPoint = Entity.extend({
		init: function () {
			this._super("trPoint" + GLOBAL_ID_COUNTER, Constants.Types.Entities.TrajectoryPoint);
			GLOBAL_ID_COUNTER ++;
			this.loadAnimations("bullet");
			this.animation.alpha = 0.3;
		}
	});

	return TrajectoryPoint;
});