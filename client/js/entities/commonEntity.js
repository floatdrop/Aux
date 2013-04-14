define(['entities/entity'], function (Entity) {

	var CommonEntity = Entity.extend({
		init: function (id) {
			this._super(id, Constants.Types.Entities.CommonEntity);
		},
		update: function (entity_info) {
			this._super(entity_info);
		},
	});

	return CommonEntity;
});