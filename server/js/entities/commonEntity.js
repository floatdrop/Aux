var Entity = require('./entity');require('../../../client/js/constants');var CommonEntity = module.exports = Entity.extend({	init: function (id, type) {		this._super(id, type, Constants.Types.Entities.CommonEntity);		this.animation = "basic";	},		getBaseState: function () {		return {			id: this.id,			kind: this.kind,			position: this.body.GetPosition(),			angle: this.getAngle(),			sprite: this.type		};	}});return CommonEntity;