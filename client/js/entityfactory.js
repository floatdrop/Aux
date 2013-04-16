/* global _ */

define(['entities/player', 'entities/commonEntity', 'entities/circleEntity', 'entities/polygonEntity', 'sprites'], 
	function (Player, CommonEntity, CircleEntity, PolygonEntity, Sprites) {
	var EntityFactory = {};

	EntityFactory.createEntity = function (entity_info, name) {
		var kind = entity_info.kind;
		if (!kind) {
			console.log("kind is undefined", entity_info);
			return;
		}

		if (!_.isFunction(EntityFactory.builders[kind])) {
			throw new Error(kind + " is not a valid Entity type");
		}

		return EntityFactory.builders[kind](entity_info, name);
	};

	EntityFactory.builders = [];

	EntityFactory.builders[Constants.Types.Entities.CommonEntity] = function (entity_info) {
		var entity = new CommonEntity(entity_info.id, entity_info.sprite);
		entity.setAnimation(entity_info.sprite, "default");
		return entity;
	};

	EntityFactory.builders[Constants.Types.Entities.PolygonEntity] = function (entity_info) {
		return new PolygonEntity(entity_info.id, "PolygonEntity");
	};

	EntityFactory.builders[Constants.Types.Entities.CircleEntity] = function (entity_info) {
		return new CircleEntity(entity_info.id, "CircleEntity");
	};

	EntityFactory.builders[Constants.Types.Entities.PLAYER] = function (entity_info) {
		var entity = new Player(entity_info.id);
		entity.setAnimation("player", "idle_right");
		return entity;
	};

	return EntityFactory;

});