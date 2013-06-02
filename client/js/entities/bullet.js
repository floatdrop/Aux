var Entity = require('entity');
module.exports = Entity.extend({
	initialize: function (id) {
		this.supr(id, "bullet");
		this.loadAnimations("bullet");
	}
});