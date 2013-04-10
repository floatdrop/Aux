var Entity = require('./entity');

require('../../../client/js/constants');

var PolygonEntity = module.exports = Entity.extend({
	init: function (id, entity) {
		this._super(id, entity.world, "PolygonEntity", Constants.Types.Entities.PolygonEntity);
		this.entity = entity;
		this.shape = entity.fixture.m_shape;
	},
	
	getBaseState: function () {
		return {
			position: this.entity.getPosition(),
			vertices: this.shape.m_vertices,
			kind: Constants.Types.Entities.PolygonEntity,
			id: this.id
		};
	}
});

return PolygonEntity;