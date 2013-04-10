/* global _ */

define(['player', 'commonEntity', 'circleEntity', 'polygonEntity', 'sprite'], 
	function (Player, CommonEntity, CircleEntity, PolygonEntity, Sprite) {
	var EntityFactory = {};

	EntityFactory.createEntity = function (entity_info, name) {
		var kind = entity_info.kind;
		if (!kind) {
			console.log.error("kind is undefined", true);
			return;
		}

		if (!_.isFunction(EntityFactory.builders[kind])) {
			throw new Error(kind + " is not a valid Entity type");
		}

		return EntityFactory.builders[kind](entity_info, name);
	};

	EntityFactory.builders = [];

	EntityFactory.builders[Constants.Types.Entities.PLAYER] = function (entity_info, name) {
		var entity = new Player(entity_info.id);
		entity.name = name;
		entity.setSprite(new Sprite("player", 1));
		entity.setAnimation("idle_right", 100);
		return entity;
	};

	EntityFactory.builders[Constants.Types.Entities.CommonEntity] = function (entity_info) {
		var entity = new CommonEntity(entity_info.id);
		var name = entity_info.sprite;
		entity.name = name;
		entity.setSprite(new Sprite(name, 1));
		entity.setAnimation("basic", 100);
		return entity;
	};

	EntityFactory.builders[Constants.Types.Entities.PolygonEntity] = function (entity_info) {
		var entity = new PolygonEntity(entity_info.id);
		entity.name = "PolygonEntity";
		entity.vertices = [];
		return entity;
	};

	EntityFactory.builders[Constants.Types.Entities.CircleEntity] = function (entity_info) {
		var entity = new CircleEntity(entity_info.id);
		entity.name = "CircleEntity";
		entity.radius = 0;
		return entity;
	};

	return EntityFactory;

});