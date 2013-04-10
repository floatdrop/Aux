var Entity = require('./entity');

require('../../../client/js/constants');

var CircleEntity = module.exports = Entity.extend({
	init: function (id, entity) {
		this._super(id, entity.world, "CircleEntity", Constants.Types.Entities.CircleEntity);
		this.entity = entity;
		this.shape = entity.fixture.m_shape;
	},
	
	getBaseState: function () {
		return {
			position: this.entity.getPosition(),
			radius: this.shape.m_radius,
			kind: Constants.Types.Entities.CircleEntity,
			id: this.id
		};
	}
});

return CircleEntity;