define(['sprites'], function (Sprites) {

	var Entity = Class.extend({
		init: function (id, kind) {
			this.id = id;
			this.kind = kind;
			this.movieclip = {
				position: new PIXI.Point()
			};
			this._container = new PIXI.DisplayObjectContainer();
		},
		getDisplayObject: function () {
			return this._container;
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
		setAnimation: function (sprite, animation) {
			if (sprite === undefined || animation === undefined || animation === this.animation) return;

			var def = Sprites.definitions[sprite];
			var adef = def.animations[animation];
			var movieclip = adef.speed === 0 ? new PIXI.Sprite(adef.textures[0]) : new PIXI.MovieClip(adef.textures);

			if (this.isAnimated()) this._container.removeChild(this.movieclip);
			this.movieclip = movieclip;
			this._container.addChild(this.movieclip);

			this._container.position = def.offset;
			this.movieclip.animationSpeed = adef.speed;
			this.movieclip.scale = adef.scale;
			this.movieclip.anchor = def.anchor;
			this.movieclip.play();
			this.animation = animation;

		},
		isAnimated: function () {
			return this.movieclip instanceof PIXI.MovieClip;
		},
		update: function (entity_info) {
			this.setAnimation(entity_info.sprite || this.kind, entity_info.animation);
			this.setPosition(entity_info.position.x, entity_info.position.y);
			this.setAngle(entity_info.angle);
		}
	});

	return Entity;
});