var Box2D = require('./box2d'),
	Entity = require('./entity'),
	_ = require('underscore'),
	cls = require('./lib/class');


var b2Vec2 = Box2D.Common.Math.b2Vec2,
	b2BodyDef = Box2D.Dynamics.b2BodyDef,
	b2AABB = Box2D.Collision.b2AABB,
	b2Body = Box2D.Dynamics.b2Body,
	b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
	b2Fixture = Box2D.Dynamics.b2Fixture,
	b2World = Box2D.Dynamics.b2World,
	b2MassData = Box2D.Collision.Shapes.b2MassData,
	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
	b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef,
	b2EdgeShape = Box2D.Collision.Shapes.b2EdgeShape;


module.exports = Engine = cls.Class.extend({
	init: function() {
		this.b2w = new b2World(new b2Vec2(0, 0), false);
		
		this.width = 8; 
		this.height = 6;

		// World walls
		this.createBox(0, 0 , this.width, 0.1, true);
		this.createBox(0, this.height, this.width, 0.1, true);
		this.createBox(0, 0, 0.1, this.height, true);
		this.createBox(this.width, 0, 0.1, this.height, true);
	},
	tick: function(fps) {
		this.b2w.Step(1 / fps, 10, 10);
		this.b2w.ClearForces();
	},
	addEntity: function(entity) {
		entity.construct(this.b2w);
	},
	getEntities: function() {
		var entities = [];
		for (var b = this.b2w.m_bodyList; b; b = b.m_next) {
			if (b.m_userData !== null) {
				entities.push(b.m_userData);
			}
		}
		return entities;
	},
	dumpEntities: function() {
		var dump = [];
		_.each(this.getEntities(), function(entity) {
			dump.push(entity.getBaseState());
		});
		return dump;
	},
	createBox: function(x, y, width, height) {
		var bodyDef = new b2BodyDef;
		bodyDef.type = b2Body.b2_staticBody;
		bodyDef.position.x = x;
		bodyDef.position.y = y;	

		var fixDef = new b2FixtureDef;
	 	fixDef.density = 1.5;
	 	fixDef.friction = 0.01;
	 	fixDef.restitution = 1;
		fixDef.shape = new b2PolygonShape;
		fixDef.shape.SetAsBox(width, height);
		return this.b2w.CreateBody(bodyDef).CreateFixture(fixDef);
	}
});