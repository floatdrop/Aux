var Box2D = require('./box2d.js'),
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

var size = 50;
var w = 900; 
var h = 500;
var D2R = Math.PI / 180;
var R2D = 180 / Math.PI;
var PI2 = Math.PI * 2;
var SCALE = 30;

module.exports = Engine = cls.Class.extend({
	init: function(fps) {	
		this.fps = fps;
		
		var worldAABB = new b2AABB();
		var gravity = new b2Vec2(0, 10);
		this.b2w = new b2World(gravity, true);
	},
	
	update: function() {
		this.b2w.Step(1 / this.fps, 10, 10)
		this.b2w.ClearForces();
	},
	
	createPlayerBody: function() {
		var bodyDef = new b2BodyDef;
		bodyDef.position.Set(200, 200);
		bodyDef.type = b2Body.b2_dynamicBody;
				
		var fixDef = new b2FixtureDef;
		fixDef.restitution = 0.2;
		fixDef.density = 2.0;
		fixDef.friction = 0.5;

		fixDef.shape = new b2PolygonShape;
		fixDef.shape.SetAsBox(10, 10);
	 	
		var body = this.b2w.CreateBody(bodyDef);
		body.CreateFixture(fixDef);
		return body;
	}
});