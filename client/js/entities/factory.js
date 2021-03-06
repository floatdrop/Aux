var Player = require('player');
var CircleEntity = require('circleEntity');
var Entity = require('entity');
var PolygonEntity = require('polygonEntity');
var Bullet = require('bullet');
var EntityFactory = {
	entities: {}
};

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
	return new Entity(entity_info.id, entity_info.sprite);
};

EntityFactory.builders[Constants.Types.Entities.PolygonEntity] = function (entity_info) {
	return new PolygonEntity(entity_info.id, "PolygonEntity");
};

EntityFactory.builders[Constants.Types.Entities.CircleEntity] = function (entity_info) {
	return new CircleEntity(entity_info.id, "CircleEntity");
};

EntityFactory.builders[Constants.Types.Entities.Player] = function (entity_info) {
	var entity = new Player(entity_info.id);
	entity.animation.set(entity_info.animation);
	entity.health = entity_info.health;
	entity.bullets = entity_info.bullets;
	entity.layer = entity_info.layer || "default";
	return entity;
};

EntityFactory.builders[Constants.Types.Entities.Bullet] = function (entity_info) {
	var entity = new Bullet(entity_info.id);
	entity.rotation = entity_info.angle || 0;
	entity.layer = entity_info.layer || "default";
	return entity;
};

module.exports = EntityFactory;