var Box2D = require('./lib/box2d'),
	_ = require('underscore'),
	cls = require('./lib/class'),
	EntityFactory = require('./entityFactory');

var b2Vec2 = Box2D.Common.Math.b2Vec2,
	b2World = Box2D.Dynamics.b2World,
	b2Body = Box2D.Dynamics.b2Body;

var Scale = 100;

var Engine = module.exports = cls.Class.extend({
	init: function (debug) {
		this.b2w = new b2World(new b2Vec2(0, 0), false);
		this.debug = debug;
	},
	tick: function (fps) {
		this.b2w.Step(1 / fps, 10, 10);
		this.b2w.ClearForces();
	},
	addEntity: function (entity) {
		entity.body = this.b2w.CreateBody(entity.bodyDef);
		entity.body.m_userData = entity;
		entity.fixture = entity.body.CreateFixture(entity.fixtureDef);
		entity.setPosition = function (x, y) {
			this.body.SetPosition(new b2Vec2(x / Scale, y / Scale));
		};
		var position = entity.getPosition();
		entity.setPosition(position.x, position.y);
		entity.getPosition = function () {
			var b2dPosition = this.body.GetPosition();
			return {
				x: b2dPosition.x * Scale,
				y: b2dPosition.y * Scale
			};
		};
		entity.setAngle = function (a) {
			this.body.SetAngle(a);
		};
		entity.setAngle(entity.getAngle());
		entity.getAngle = function () {
			return this.body.GetAngle();
		};
	},
	addEntities: function (entities_list) {
		var self = this;
		_.each(entities_list, function (entity) {
			self.addEntity(entity);
		});
	},
	removeEntity: function (id) {
		var entities = this.getEntities();
		var entity = _.find(entities, function (entity) {
			return entity.id === id;
		});
		this.b2w.DestroyBody(entity.body);
	},
	getEntities: function () {
		var entities = [];
		for (var b = this.b2w.m_bodyList; b; b = b.m_next) {
			if (b.m_userData !== null) {
				b.m_userData.isStatic = b.m_type === b2Body.b2_staticBody;
				entities.push(b.m_userData);
			}
		}
		return entities;
	},
	dumpEntities: function (filter_function) {
		var self = this,
			dump = [];
		if (!filter_function) filter_function = function (e) { return e; };
		_.chain(this.getEntities()).filter(filter_function).each(function (entity) {
			dump.push(entity.getBaseState());
			if (self.debug) {
				dump.push(EntityFactory.getShapeByEntity(entity).getBaseState());
			}
		});
		return dump;
	}
});

Engine.getPoints = function (points) {
	var scaledPoints = [];
	_.each(points, function (point) {
		scaledPoints.push({
			x: point.x / Scale,
			y: point.y / Scale
		});
	});
	return scaledPoints;
};

Engine.getBoxPoints = function (width, height) {
	return [{
		x: 0,
		y: 0
	}, {
		x: width / Scale,
		y: 0
	}, {
		x: width / Scale,
		y: height / Scale
	}, {
		x: 0,
		y: height / Scale
	}, ];
};


return Engine;