define(['entity', 'sprite'], function (Entity, Sprite) {

	var SimpleGameObject = Entity.extend({
		init: function (entity_info) {
			var name = entity_info.sprite;
			this._super(entity_info.id, Constants.Types.Entities.CommonEntity);
			this.name = name;
			this.setSprite(new Sprite(name, 1));
			this.setAnimation("basic", 100);
		},

		update: function (entity_info) {
			this.setSprite(new Sprite(entity_info.sprite, 1));
		}
	});

	return SimpleGameObject;
});