var Entity = require('./entity');

require('../../../client/js/constants');

var CircleEntity = module.exports = Entity.extend({
	init: function (id, entity) {
		this._super(id, type, Constants.Types.Entities.CircleEntity);
	},
	
	getBaseState: function () {
		return {
			id: this.id,
			kind: this.kind,
			position: this.body.GetPosition(),
			angle: this.getAngle(),
		};
	}
});

return CircleEntity;