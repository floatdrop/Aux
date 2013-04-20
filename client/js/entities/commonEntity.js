define(['entities/entity'], function (Entity) {

	var CommonEntity = Entity.extend({
		init: function (id, kind) {
			this._super(id, kind);
		},
		update: function (entity_info) {
			this._super(entity_info);
		}
	});

	return CommonEntity;
});