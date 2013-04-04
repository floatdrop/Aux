define(['entity', 'sprite'], function (Entity, Sprite) {

	var SimpleGameObject = Entity.extend({
		init: function (id, name) {
			this._super(id, name);
			this.name = name;
			this.setSprite(new Sprite("empty", 1));
			this.setAnimation("basic", 100);
		},

		update: function (entity_info) {
			this.setSprite(new Sprite(entity_info.sprite, 1));
		}
	});

	return SimpleGameObject;
});