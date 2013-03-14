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
	init: function() {
		this.b2w = new b2World(new b2Vec2(0, 10), true);

		this.createDOMObjects(Math.random()* (w-size),Math.random()* (h-size),size, Math.random() > .5);
		this.createDOMObjects(Math.random()* (w-size),Math.random()* (h-size),size, Math.random() > .5);
		this.createDOMObjects(Math.random()* (w-size),Math.random()* (h-size),size, Math.random() > .5);
		this.createDOMObjects(Math.random()* (w-size),Math.random()* (h-size),size, Math.random() > .5);
		this.createDOMObjects(Math.random()* (w-size),Math.random()* (h-size),size, Math.random() > .5);
		this.createDOMObjects(Math.random()* (w-size),Math.random()* (h-size),size, Math.random() > .5);
		this.createDOMObjects(Math.random()* (w-size),Math.random()* (h-size),size, Math.random() > .5);
		this.createDOMObjects(Math.random()* (w-size),Math.random()* (h-size),size, Math.random() > .5);
		this.createDOMObjects(Math.random()* (w-size),Math.random()* (h-size),size, Math.random() > .5);

		this.createBox(0, 0 , w, 5, true);
		this.createBox(0, h , w, 5, true);
		this.createBox(0,0,5,h, true);
		this.createBox(w,0,5,h, true);
	},
	tick: function(fps) {
		this.b2w.Step(1 / fps, 10, 10)
		this.b2w.ClearForces();
	},
	updatePlayer: function(player) {
		player.emit('css', this.drawDOMObjects());
	},
	drawDOMObjects: function() {
		var ret = [];
		var i = 0;
		for (var b = this.b2w.m_bodyList; b; b = b.m_next) {
			for (var f = b.m_fixtureList; f; f = f.m_next) {
				if (f.m_userData) {
					var x = Math.floor((f.m_body.m_xf.position.x * SCALE) -  f.m_userData.width);
					var y = Math.floor((f.m_body.m_xf.position.y * SCALE) - f.m_userData.height);
					var r = Math.round(((f.m_body.m_sweep.a + PI2) % PI2) * R2D * 100) / 100;
					var css = {	'-webkit-transform':'translate(' + x + 'px,' + y + 'px) rotate(' + r  + 'deg)', 
								'-moz-transform':'translate(' + x + 'px,' + y + 'px) rotate(' + r  + 'deg)', 
								'-ms-transform':'translate(' + x + 'px,' + y + 'px) rotate(' + r  + 'deg)', 
								'-o-transform':'translate(' + x + 'px,' + y + 'px) rotate(' + r  + 'deg)', 
								'transform':'translate(' + x + 'px,' + y + 'px) rotate(' + r  + 'deg)'};
						if (f.m_userData.circle) {
							css['-webkit-border-radius'] = css['-moz-border-radius'] = css['border-radius'] = f.m_userData.width  + 'px';
						}
						css['width'] = (f.m_userData.width * 2) + 'px';
						css['height'] = (f.m_userData.height * 2) + 'px';
						f.m_userData.setup = false;
					ret.push(css);
				}
			}
		}
	return ret;
	},
	createDOMObjects: function(x, y, size, circle) {
		var domObj = {id:'foo'};
		var domPos = {left:x, top:y};
		var width = size / 2;
		var height = size / 2;
		
	    var x = (domPos.left) + width;
	    var y = (domPos.top) + height;
	    var body = this.createBox(x,y,width,height, false, circle);
		body.m_userData = {domObj:domObj, width:width, height:height, circle: circle ? true : false, setup: true};
	},
	createBox: function(x, y, width, height, static, circle) {
		var bodyDef = new b2BodyDef;
		bodyDef.type = static ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;
		bodyDef.position.x = x / SCALE;
		bodyDef.position.y = y / SCALE

		var fixDef = new b2FixtureDef;
	 	fixDef.density = 1.5;
	 	fixDef.friction = 0.01;
	 	fixDef.restitution = 1;

	 	if (circle) {
	 		var circleShape = new b2CircleShape;
			circleShape.m_radius = width / SCALE;

			fixDef.shape = circleShape;
	 	} else {
			fixDef.shape = new b2PolygonShape;
			fixDef.shape.SetAsBox(width / SCALE, height / SCALE);
	 	}
		return this.b2w.CreateBody(bodyDef).CreateFixture(fixDef);
	}
});