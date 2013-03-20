define(['player'], function(Player) {
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

	EntityFactory.builders[Types.Entities.PLAYER] = function(id, name) {
		return new Player(id, name);
	};

	return EntityFactory;

});