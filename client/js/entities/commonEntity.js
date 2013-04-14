define(['entities/entity'], function (Entity) {

	var CommonEntity = Entity.extend({
		init: function (id, name) {
			this._super(id, name);
		},
		update: function (entity_info) {
			this._super(entity_info);
		},
	});

	return CommonEntity;
});