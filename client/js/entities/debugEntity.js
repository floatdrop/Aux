define(['entities/entity'], function (Entity) {

	var DebugEntity = Entity.extend({
		init: function (id) {
			this._super(id, Constants.Types.Entities.CircleEntity);
		},
		getPosition: function () {
			return {
				x: this.animation.worldTransform[2],
				y: this.animation.worldTransform[5]
			};
		}
	});

	return DebugEntity;
});