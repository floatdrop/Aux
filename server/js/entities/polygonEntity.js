var Entity = require('./entity');

require('../../../client/js/constants');

var PolygonEntity = module.exports = Entity.extend({
	init: function (id) {
		this._super(id, "PolygonEntity", Constants.Types.Entities.PolygonEntity);
	},
	
	getBaseState: function () {
		return {
			position: this.entity.getPosition(),
			vertices: this.shape.m_vertices,
			kind: this.kind,
			id: this.id
		};
	}
});

return PolygonEntity;