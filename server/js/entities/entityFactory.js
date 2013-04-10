var Entity = require('./entity'),
	PolygonEntity = require('./polygonEntity'),
	CircleEntity = require('./circleEntity'),
	cls = require('../lib/class'),
	Box2D = require('../lib/box2d'),
	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

var EntityFactory = module.exports = cls.Class.extend({});

EntityFactory.getShapeByEntity = function (entity) {
	var id = "debug-" + entity.id,
		shape = entity.fixture.m_shape;

	if (shape instanceof b2PolygonShape)
		return EntityFactory.createPolygonEntity(id, entity, shape);
	if (shape instanceof b2CircleShape)
		return EntityFactory.createCircleEntity(id, entity, shape);
};

EntityFactory.createPolygonEntity = function (id, entity, shape) {
	var polygonEntity = new PolygonEntity(id);
	polygonEntity.entity = entity;
	polygonEntity.shape = entity.fixture.m_shape;
	return polygonEntity;
};

EntityFactory.createCircleEntity = function (id, entity, shape) {
	var circleEntity = new CircleEntity(id);
	circleEntity.entity = entity;
	circleEntity.shape = entity.fixture.m_shape;
	return circleEntity;
};

return EntityFactory;