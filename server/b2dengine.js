var Box2D = require('./vendor/box2d'),
	b2Vec2 = Box2D.Common.Math.b2Vec2,
	b2World = Box2D.Dynamics.b2World,
	b2Body = Box2D.Dynamics.b2Body,
	b2listener = Box2D.Dynamics.b2ContactListener;

var Scale = 100;

var Engine = module.exports = klass({
	Scale: Scale,

	initialize: function (viewarea) {
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
	isVisible: function (entityA, entityB) {
		var a = entityA.position;
		var b = entityB.position;
		return Math.abs(b.x - a.x) < this.viewarea.width && Math.abs(b.y - a.y) < this.viewarea.height;
	},
	preSolve: function (contact) {
		var obj1 = contact.GetFixtureA().GetBody().GetUserData(),
			obj2 = contact.GetFixtureB().GetBody().GetUserData(),
			enabled1 = obj1.onCollision(obj2, contact),
			enabled2 = obj2.onCollision(obj1, contact);

		contact.SetEnabled(enabled1 && enabled2);
	},
	addEntity: function (entity) {
		entity.bodyDef.position = {
			x: entity.position.x / Scale,
			y: entity.position.y / Scale
		};
		entity.body = this.b2w.CreateBody(entity.bodyDef);
		entity.body.m_userData = entity;
		if (entity.fixtureDef) {
			entity.fixture = entity.body.CreateFixture(entity.fixtureDef);
		}
		Object.defineProperty(entity, 'position', {
			get: function () {
				return {
					x: entity.body.m_xf.position.x * Scale,
					y: entity.body.m_xf.position.y * Scale
				};
			},
			set: function (value) {
				entity.body.SetPosition(value);
			}
		});
		Object.defineProperty(entity, 'angle', {
			get: function () {
				return entity.body.m_sweep.a;
			},
			set: function (value) {
				entity.body.SetAngle(value);
			}
		});
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
		x: -width / Scale,
		y: -height / Scale
	}, {
		x: width / Scale,
		y: -height / Scale
	}, {
		x: width / Scale,
		y: height / Scale
	}, {
		x: -width / Scale,
		y: height / Scale
	}];
};


return Engine;