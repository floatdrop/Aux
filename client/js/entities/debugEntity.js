define(['entities/entity'], function (Entity) {

	var DebugEntity = Entity.extend({
		init: function (id) {
			this._super(id, Constants.Types.Entities.CircleEntity);
			this.movieclip = PIXI.Sprite.fromImage("img/1/empty.png");
            this.movieclip.visible = true;
            this._container.addChild(this.movieclip);
		},
		getPosition: function () {
			return {
				x: this.movieclip.worldTransform[2],
				y: this.movieclip.worldTransform[5]
			};
		}
	});

	return DebugEntity;
});