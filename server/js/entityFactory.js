var PolygonEntity = require('./entities/polygonEntity'),
	CircleEntity = require('./entities/circleEntity'),
	CommonEntity = require('./entities/commonEntity'),
	Bullet = require('./entities/bullet'),
	_ = require('underscore'),
	log = require('./log'),
	cls = require('./lib/class'),
	Box2D = require('./lib/box2d'),
	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

var EntityFactory = module.exports = cls.Class.extend({});
var Engine = require('./b2dengine');

EntityFactory.createEntity = function (entity_info) {
	var entity = new CommonEntity(null, entity_info.type);
	if (entity_info.points) {
		entity.setBodyDefAsPoly(Engine.getPoints(entity_info.points));
	} else {
		entity.setBodyDefAsPoly(Engine.getBoxPoints(entity_info.width, entity_info.height));
	}
	entity.setPosition(entity_info.x, entity_info.y);
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
	var position = entity.getPosition();
	polygonEntity.setPosition(position.x, position.y);
	polygonEntity.setAngle(polygonEntity.getAngle());
	return polygonEntity;
};

EntityFactory.createCircleEntity = function (id, entity) {
	var circleEntity = new CircleEntity(id);
	circleEntity.entity = entity;
	circleEntity.shape = entity.fixture.m_shape;
	var position = entity.getPosition();
	circleEntity.setPosition(position.x, position.y);
	circleEntity.setAngle(circleEntity.getAngle());
	return circleEntity;
};

EntityFactory.createBullet = function (player) {
	var bullet = new Bullet(null, player),
		position = player.getPosition();
	bullet.setPosition(position.x, position.y);
	return bullet;
};

EntityFactory.createEmptyCircleEntity = function (id) {
	return new CircleEntity(id);
};

return EntityFactory;