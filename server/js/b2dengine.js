var Box2D = require('./lib/box2d'),
	_ = require('underscore'),
	cls = require('./lib/class'),
	EntityFactory = require('./entityFactory');

var b2Vec2 = Box2D.Common.Math.b2Vec2,
	b2World = Box2D.Dynamics.b2World,
	b2Body = Box2D.Dynamics.b2Body,
	b2SimplexCache = Box2D.Collision.b2SimplexCache,
	b2Distance = Box2D.Collision.b2Distance,
	b2Transform_identity = Box2D.Common.Math.b2Math.b2Transform_identity,
	b2DistanceInput = Box2D.Collision.b2DistanceInput,
	b2DistanceOutput = Box2D.Collision.b2DistanceOutput,
	b2DistanceProxy = Box2D.Collision.b2DistanceProxy,
	b2listener = Box2D.Dynamics.b2ContactListener;

var Scale = 100;

var Engine = module.exports = cls.Class.extend({
	Scale: Scale,

	init: function (viewarea) {
		this.b2w = new b2World(new b2Vec2(0, 0), false);
		this.viewarea = viewarea;
		var listener = new b2listener();
		listener.PreSolve = this.preSolve;
		this.b2w.SetContactListener(listener);
	},
	tick: function (fps) {
		this.b2w.Step(1 / fps, 10, 10);
		this.b2w.ClearForces();
	},
	isVisible: function (a, b) {
		var a_proxy = new b2DistanceProxy();
		a_proxy.Set(a.fixture.GetShape());
		var b_proxy = new b2DistanceProxy();
		b_proxy.Set(b.fixture.GetShape());
		var input = new b2DistanceInput();
		input.proxyA = a_proxy;
		input.transformA = b2Transform_identity;
		input.proxyB = b_proxy;
		input.transformB = b2Transform_identity;
		var output = new b2DistanceOutput();
		var simplexCache = new b2SimplexCache();
		simplexCache.count = 0;
		b2Distance.Distance(output, simplexCache, input);
		if (Math.abs(output.pointB.x - output.pointA.x) < this.viewarea.width && Math.abs(output.pointB.y - output.pointA.y) < this.viewarea.height) return true;
		return false;
	},
	preSolve: function (contact) {
		var obj1 = contact.GetFixtureA().GetBody().GetUserData(),
			obj2 = contact.GetFixtureB().GetBody().GetUserData(),
			enabled1 = obj1.onCollision(obj2, contact),
			enabled2 = obj2.onCollision(obj1, contact);
		
		contact.SetEnabled(enabled1 && enabled2);
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
	getEntities: function (filter_function) {
		var entities = [];
		if (!filter_function) {
			filter_function = function (e) {
				return e;
			};
		}
		for (var b = this.b2w.m_bodyList; b; b = b.m_next) {
			if (b.m_userData !== null) {
				b.m_userData.isStatic = b.m_type === b2Body.b2_staticBody;
				if (filter_function(b.m_userData)) {
					entities.push(b.m_userData);
				}
			}
		}
		return entities;
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