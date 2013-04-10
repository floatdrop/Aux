var Entity = require('./entity');

require('../../../client/js/constants');

var CircleEntity = module.exports = Entity.extend({
	init: function (id) {
		this._super(id, "CircleEntity", Constants.Types.Entities.CircleEntity);
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