/* global _ */

define(['player', 'commonEntity'], function (Player, CommonEntity) {
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
		return new Player(entity_info.id, name);
	};

	EntityFactory.builders[Constants.Types.Entities.CommonEntity] = function (entity_info) {
		return new CommonEntity(entity_info);
	};

	return EntityFactory;

});