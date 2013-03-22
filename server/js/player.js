var cls = require("./lib/class"),
	Box2D = require('./box2d'),
    Entity = require('./entity'),
    Log = require('log'),
    Constants = require('../../client/js/constants'),
    _ = require("underscore");

var	b2BodyDef = Box2D.Dynamics.b2BodyDef,
    b2Body = Box2D.Dynamics.b2Body,
	b2Vec2 = Box2D.Common.Math.b2Vec2,
	b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

module.exports = Player = Entity.extend({
    init: function(socket) {
    	var self = this;
    	this.socket = socket;
    	this._super(this.socket.id, "player", Types.Entities.PLAYER);

    	this.socket.on('action', function (data) { self.onAction(data); });
    	this.socket.on('angle', function (data) { self.onAngle(data); });

		this.bodyDef = new b2BodyDef;
		this.bodyDef.type = b2Body.b2_dynamicBody;
		this.bodyDef.position = this.position;

		this.fixtureDef = new b2FixtureDef;
	 	this.fixtureDef.density = 1.5;
	 	this.fixtureDef.friction = 0.01;
	 	this.fixtureDef.restitution = 1;

 		var circleShape = new b2CircleShape;
		circleShape.m_radius = 0.1;
		this.fixtureDef.shape = circleShape;
    },
    construct: function(b2w) {
        this.world = b2w;
        this.body = b2w.CreateBody(this.bodyDef);
        this.body.m_userData = this;
        this.fixture = this.body.CreateFixture(this.fixtureDef);
        this.getPosition = function() {
            return this.body.GetPosition();
        }
        this.setPosition = function(x, y) {
            this.body.SetPosition(new b2Vec2(x,y));
        }
    },
    destruct: function() {
        this.world.DestroyBody(this.body);
    },
    move_up: function() {
    	this.body.ApplyImpulse(new b2Vec2(0, -0.01), new b2Vec2(0, 0));
    },
    move_down: function() {
       	this.body.ApplyImpulse(new b2Vec2(0, 0.01), new b2Vec2(0, 0));
    },
    move_left: function() {
    	this.body.ApplyImpulse(new b2Vec2(-0.01, 0), new b2Vec2(0, 0));
    },
    move_right: function() {
    	this.body.ApplyImpulse(new b2Vec2(0.01, 0), new b2Vec2(0, 0));
    },
    turn_cw: function() {

    },
    turn_ccw: function() {

    },
    onAction: function(data) {
    	if (this.body === undefined)
    		return false;
    	if (data == "up")
    		this.move_up();
    	if (data == "down")
    		this.move_down();
    	if (data == "left")
      		this.move_left();
    	if (data == "right")
    		this.move_right();
    },
    onAngle: function(data) {
        if (this.body === undefined)
            return false;
    	if (this.angle > parseFloat(data))
    		this.scheduleAction(this.turn_cw, 0);
    	else
    		this.scheduleAction(this.turn_ccw, 0);
    }
});