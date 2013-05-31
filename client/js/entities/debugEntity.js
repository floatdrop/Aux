define(['entities/entity'], function (Entity) {

	var DebugEntity = Entity.extend({
		init: function (id) {
			this._super(id, Constants.Types.Entities.CircleEntity);
		}
	});

	return DebugEntity;
});