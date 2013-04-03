define(['player', 'commonEntity', 'underscore'], function (Player, CommonEntity, _) {
	var EntityFactory = {};

	EntityFactory.createEntity = function (kind, id, name) {
		if (!kind) {
			console.log.error("kind is undefined", true);
			return;
		}

		if (!_.isFunction(EntityFactory.builders[kind])) {
			throw new Error(kind + " is not a valid Entity type");
		}

		return EntityFactory.builders[kind](id, name);
	};

	EntityFactory.builders = [];

	EntityFactory.builders[Constants.Types.Entities.PLAYER] = function (id, name) {
		return new Player(id, name);
	};

	EntityFactory.builders[Constants.Types.Entities.CommonEntity] = function (id, name) {
		return new CommonEntity(id, name);
	};

	return EntityFactory;

});