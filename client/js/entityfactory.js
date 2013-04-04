define(['player', 'commonEntity'], function(Player, CommonEntity) {
	var EntityFactory = {};

	EntityFactory.createEntity = function(kind, id, name) {
		if(!kind) {
			log.error("kind is undefined", true);
			return;
		}

		if(!_.isFunction(EntityFactory.builders[kind])) {
			throw Error(kind + " is not a valid Entity type");
		}

		return EntityFactory.builders[kind](id, name);
	};

	EntityFactory.builders = [];

	EntityFactory.builders[Constants.Types.Entities.PLAYER] = function(id, name) {
		return new Player(id, name);
	};

	EntityFactory.builders[Constants.Types.Entities.CommonEntity] = function(id, name) {
		return new CommonEntity(id, "CommonEntity");
	};

	EntityFactory.builders[Constants.Types.Entities.CircleEntity] = function(id, name) {
		return new CommonEntity(id, "CircleEntity");
	};

	EntityFactory.builders[Constants.Types.Entities.PolygonEntity] = function(id, name) {
		return new CommonEntity(id, "PolygonEntity");
	};

	return EntityFactory;

});