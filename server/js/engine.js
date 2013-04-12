var Box2D = require('./lib/box2d'),
	_ = require('underscore'),
	cls = require('./lib/class'),
	EntityFactory = require('./entities/entityFactory');

var b2Vec2 = Box2D.Common.Math.b2Vec2,
	b2World = Box2D.Dynamics.b2World,
	b2BodyDef = Box2D.Dynamics.b2BodyDef,
	b2Body = Box2D.Dynamics.b2Body,
	b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
	b2Vec2 = Box2D.Common.Math.b2Vec2,
	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

var Engine = module.exports = cls.Class.extend({
	init: function (config) {
		this.b2w = new b2World(new b2Vec2(0, 0), false);
		this.entities = [];
		this.config = config;
	},
	tick: function (fps) {
		this.b2w.Step(1 / fps, 10, 10);
		this.b2w.ClearForces();
	},
	addEntity: function (entity) {
		entity.construct();
		this.entities.push(entity);
	},
	removeEntity: function (entity) {
		var index = this.entities.indexOf(entity);
		this.entities.splice(index, 1);
		entity.destruct(this.b2w);		
	},
	getEntities: function () {
		return this.entities;
	},
	dumpEntities: function () {
		var dump = [];
		if (this.config.drawDebug) {
			_.each(this.getEntities(), function (entity) {
				dump.push(entity.getBaseState());
				dump.push(EntityFactory.getShapeByEntity(entity).getBaseState());
			});
		} else {
			_.each(this.getEntities(), function (entity) {
				dump.push(entity.getBaseState());
			});
		}
		return dump;
	}
});

Engine.createPolygon = function (b2w, x, y, points) {
	var body = this.createBody(b2w, x, y);
	return this.createPolygonFixture(body, points);
};

Engine.createCircle = function (b2w, x, y, radius) {
	var body = this.createBody(b2w, x, y);
	return this.createCircleFixture(body, radius);
};

Engine.createBoxFixture = function (body, width, height) {
	var fixDef = new b2FixtureDef();
	fixDef.density = 1.5;
	fixDef.friction = 1;
	fixDef.restitution = 1;
	fixDef.shape = new b2PolygonShape();
	fixDef.shape.SetAsBox(width, height);
	return body.CreateFixture(fixDef);
};

Engine.createPolygonFixture = function (body, points) {
	var fixDef = new b2FixtureDef();
	fixDef.density = 15;
	fixDef.friction = 1;
	fixDef.restitution = 1;

	fixDef.shape = new b2PolygonShape();
	fixDef.shape.SetAsArray(points);
	return body.CreateFixture(fixDef);
};

Engine.createCircleFixture = function (body, radius) {
	var fixDef = new b2FixtureDef();
	fixDef.density = 1.5;
	fixDef.friction = 1;
	fixDef.restitution = 1;

	fixDef.shape = new b2CircleShape();
	fixDef.shape.m_radius = radius;
	return body.CreateFixture(fixDef);
};

Engine.createBody = function (b2w, x, y) {
	var bodyDef = new b2BodyDef();
	bodyDef.type = b2Body.b2_staticBody;
	bodyDef.position.x = x;
	bodyDef.position.y = y;
	return b2w.CreateBody(bodyDef);
};

return Engine;