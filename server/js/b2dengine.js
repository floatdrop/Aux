var Box2D = require('./lib/box2d'),
	_ = require('underscore'),
	cls = require('./lib/class'),
	EntityFactory = require('./entities/entityFactory');

var b2Vec2 = Box2D.Common.Math.b2Vec2,
	b2World = Box2D.Dynamics.b2World;

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
			this.body.SetPosition(new b2Vec2(x, y));
		};
		var position = entity.getPosition();
		entity.setPosition(position.x, position.y);
		entity.getPosition = function () {
			var b2dPosition = this.body.GetPosition();
			return { x: b2dPosition.x, y: b2dPosition.y };
		};
		entity.setAngle = function (a) {
			this.body.SetAngle(a);
		};
		entity.setAngle(entity.getAngle());
		entity.getAngle = function () {
			return this.body.GetAngle();
		};
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
				entities.push(b.m_userData);
			}
		}
		return entities;
	},
	dumpEntities: function () {
		var self = this,
			dump = [];
		_.each(this.getEntities(), function (entity) {
			dump.push(entity.getBaseState());
			if (self.debug) {
				dump.push(EntityFactory.getShapeByEntity(entity).getBaseState());
			}
		});
		return dump;
	}
});

return Engine;