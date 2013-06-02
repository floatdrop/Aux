var Entity = require('entity');

module.exports = Entity.extend({
	initialize: function (id) {
		this.supr(id, "player");
		this.loadAnimations("player");
	}
});