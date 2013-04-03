var Box2D = require('./box2d'),
	Entity = require('./entity'),
	_ = require('underscore'),
	cls = require('./lib/class'),
	RectangleEntity = require('./rectangleEntity');

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
	init: function(debug) {
		this.b2w = new b2World(new b2Vec2(0, 0), false);
		this.entities = [];
		this.debug = debug;
	},
	tick: function(fps) {
		this.b2w.Step(1 / fps, 10, 10);
		this.b2w.ClearForces();
	},
	addEntity: function(entity) {
		entity.construct();
		entity.index = this.entities.length;
		this.entities.push(entity);
		if (this.debug){
			//this.entities.push(this.createShape(entity));
		}
	},
	removeEntity: function(entity) {
		entity.destruct();
		this.entities.splice(entity.index, 1);
	},
	createShape: function(entity){
		var id = this.entities.length;
		return new RectangleEntity(id, this.b2w, entity);
	},

	getEntities: function() {
		// var entities = [];
		// for (var b = this.b2w.m_bodyList; b; b = b.m_next) {
		// 	if (b.m_userData !== null) {
		// 		entities.push(b.m_userData);
		// 	}
		// }
		return this.entities;
	},
	dumpDebugEntities: function(){
		var entities = [];
		for (var b = this.b2w.m_bodyList; b; b = b.m_next) {
			if (b.m_fixtureCount != 0){
				
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
	}
});