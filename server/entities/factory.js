var PolygonEntity = require('./polygonEntity'),
	CircleEntity = require('./circleEntity'),
	CommonEntity = require('./commonEntity'),
	Bullet = require('./bullet'),
	Box2D = require('../vendor/box2d'),
	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var Engine = require('../b2dengine');

var EntityFactory = module.exports = Class.extend({});

EntityFactory.createEntity = function (entity_info) {
	var entity = new CommonEntity(null, entity_info.type);
	if (entity_info.points) {
		entity.setBodyDefAsPoly(Engine.getPoints(entity_info.points));
	} else {
		entity.setBodyDefAsPoly(Engine.getBoxPoints(entity_info.width || 16, entity_info.height || 16));
	}
	entity.position = { x: entity_info.x, y: entity_info.y };
	return entity;
};

EntityFactory.getShapeByEntity = function (entity) {
	var id = "debug-" + entity.id,
		shape = entity.fixture.m_shape;

	if (shape instanceof b2PolygonShape)
		return EntityFactory.createPolygonEntity(id, entity, shape);
	if (shape instanceof b2CircleShape)
		return EntityFactory.createCircleEntity(id, entity, shape);
	log.error('Unknown shape is ' + shape + "\r\nEntity is " + entity);
	return EntityFactory.createEmptyCircleEntity(id);
};

EntityFactory.ConvertB2VecToJson = function (b2vecpoints) {
	var points = [];
	_.each(b2vecpoints, function (point) {
		points.push({
			x: point.x,
			y: point.y
		});
	});
	return points;
};

EntityFactory.createPolygonEntity = function (id, entity) {
	var polygonEntity = new PolygonEntity(id,
		EntityFactory.ConvertB2VecToJson(entity.fixtureDef.shape.m_vertices));
	polygonEntity.entity = entity;
	polygonEntity.shape = entity.fixture.m_shape;
	polygonEntity.position = entity.position; 
	polygonEntity.angle = polygonEntity.angle;
	return polygonEntity;
};

EntityFactory.createCircleEntity = function (id, entity) {
	var circleEntity = new CircleEntity(id);
	circleEntity.entity = entity;
	circleEntity.shape = entity.fixture.m_shape;
	circleEntity.position = entity.position; 
	circleEntity.angle = circleEntity.angle;
	return circleEntity;
};

EntityFactory.createBullet = function (player) {
	var bullet = new Bullet(null, player);
	bullet.position = player.position; 
	return bullet;
};

EntityFactory.createEmptyCircleEntity = function (id) {
	return new CircleEntity(id);
};

return EntityFactory;