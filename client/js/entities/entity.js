define(['sprites'], function (Sprites) {

	var Entity = Class.extend({
		init: function (id, kind) {
			this.id = id;
			this.kind = kind;
			this.movieclip = {
				position: new PIXI.Point()
			};
		},
		getPosition: function () {
			return this.movieclip.position;
		},
		setPosition: function (x, y) {
			this.movieclip.position.x = x * 100;
			this.movieclip.position.y = y * 100;
		},
		getAngle: function () {
			return this.movieclip.rotation;
		},
		setAngle: function () {
			// this.movieclip.rotation = a;
		},
		update: function (entity_info) {
			Sprites.ApplyAnimation(this, this.kind, entity_info.animation);
			this.setPosition(entity_info.position.x, entity_info.position.y);
			this.setAngle(entity_info.angle);
		}
	});

	return Entity;
});