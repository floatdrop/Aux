var cls = require("./lib/class"),
	Box2D = require('./box2d.js'),
    _ = require("underscore");

var	b2BodyDef = Box2D.Dynamics.b2BodyDef,
	b2Vec2 = Box2D.Common.Math.b2Vec2,
	b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

module.exports = Player = cls.Class.extend({
    init: function(socket) {
    	var self = this;
    	this.socket = socket;
    	this._super(this.socket.id, "player", Types.Entities.PLAYER);

    	this.socket.on('action', this.onAction);
    	this.socket.on('angle', this.onAngle);

		this.bodyDef = new b2BodyDef;
		this.bodyDef.type = b2Body.b2_dynamicBody;
		this.bodyDef.position = this.position;

		this.fixtureDef = new b2FixtureDef;
	 	this.fixtureDef.density = 1.5;
	 	this.fixtureDef.friction = 0.01;
	 	this.fixtureDef.restitution = 1;

 		var circleShape = new b2CircleShape;
		circleShape.m_radius = width;
		this.fixtureDef.shape = circleShape;
    },
    move_up: function() {
    	this.body.ApplyImplse(new b2Vec2(-1, 0), new b2Vec2(0, 0));
    },
    move_down: function() {
    	this.body.ApplyImplse(new b2Vec2(1, 0), new b2Vec2(0, 0));
    },
    move_left: function() {
    	this.body.ApplyImplse(new b2Vec2(0, -1), new b2Vec2(0, 0));
    },
    move_right: function() {
    	this.body.ApplyImplse(new b2Vec2(0, 1), new b2Vec2(0, 0));
    },
    turn_cw: function() {

    },
    turn_ccw: function() {

    },
    onAction: function(data) {
    	if (!(this.body))
    		return false;
    	if (data == "up")
    		this.scheduleAction(this.move_up, 0);
    	if (data == "down")
    		this.scheduleAction(this.move_down, 0);
    	if (data == "left")
      		this.scheduleAction(this.move_left, 0);
    	if (data == "right")
    		this.scheduleAction(this.move_right, 0);
    },
    onAngle: function(data) {
    	if (this.angle > parseFloat(data))
    		this.scheduleAction(this.turn_cw, 0);
    	else
    		this.scheduleAction(this.turn_ccw, 0);
    }
});