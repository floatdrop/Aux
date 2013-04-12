var PolygonEntity = require('./polygonEntity'),
	CircleEntity = require('./circleEntity'),
	cls = require('../lib/class'),
	_ = require('underscore'),
	Box2D = require('../lib/box2d'),
	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

var EntityFactory = module.exports = cls.Class.extend({});

EntityFactory.createEntity = function (entity_info) {
	if (entity_info.polyline) {
		var points = [];
		_.each(entity_info.polyline.reverse(), function (point) {
			points.push({x: point.x, y: point.y});
		});
		return new PolygonEntity(null, points);
	} else {
		return new PolygonEntity(null, EntityFactory.getBoxPoints(entity_info.width, entity_info.height));
	}
};


EntityFactory.getBoxPoints = function (width, height) {
	return [ 
		{x: 0, y: 0},
		{x: width, y: 0},
		{x: width, y: height},
		{x: 0, y: height},
	];
};

EntityFactory.getShapeByEntity = function (entity) {
	var id = "debug-" + entity.id,
		shape = entity.fixture.m_shape;

	if (shape instanceof b2PolygonShape) return EntityFactory.createPolygonEntity(id, entity, shape);
	if (shape instanceof b2CircleShape) return EntityFactory.createCircleEntity(id, entity, shape);
};

EntityFactory.createPolygonEntity = function (id, entity) {
	var polygonEntity = new PolygonEntity(id);
	polygonEntity.entity = entity;
	polygonEntity.shape = entity.fixture.m_shape;
	return polygonEntity;
};

EntityFactory.createCircleEntity = function (id, entity) {
	var circleEntity = new CircleEntity(id);
	circleEntity.entity = entity;
	circleEntity.shape = entity.fixture.m_shape;
	return circleEntity;
};

return EntityFactory;