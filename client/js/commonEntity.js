define(['entity', 'sprite'], function (Entity, Sprite) {

	var SimpleGameObject = Entity.extend({
		init: function (id) {
			this._super(id, Constants.Types.Entities.CommonEntity);
		},

		update: function (entity_info) {
			this._super(entity_info);
			this.setSprite(new Sprite(entity_info.sprite, 1));
		}
	});

	return SimpleGameObject;
});