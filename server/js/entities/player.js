var Box2D = require('../lib/box2d'),
	Entity = require('../entity'),
	_ = require('underscore');

require('../../../client/js/constants');

var b2BodyDef = Box2D.Dynamics.b2BodyDef,
	b2Body = Box2D.Dynamics.b2Body,
	b2Vec2 = Box2D.Common.Math.b2Vec2,
	b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

var Player = module.exports = Entity.extend({
	init: function (connection, id) {
		var self = this;
		this.connection = connection;
		this._super(id, "player", Constants.Types.Entities.PLAYER);

		this.send(Constants.Types.Messages.Welcome, {
			id: id
		});
		this.animation = "idle_right";

		this.connection.listen(function (message) {
			self.callbacks[message.t](message.d);
		});

		this.callbacks = {};
		this.callbacks[Constants.Types.Messages.Action] = function (data) {
			self.onAction(data);
		};
		this.callbacks[Constants.Types.Messages.Angle] = function (data) {
			self.onAngle(data);
		};

		this.bodyDef = new b2BodyDef();
		this.bodyDef.type = b2Body.b2_dynamicBody;
		this.bodyDef.linearDamping = 4;

		this.fixtureDef = new b2FixtureDef();
		this.fixtureDef.density = 1.5;
		this.fixtureDef.friction = 0.01;
		this.fixtureDef.restitution = 1;

		var circleShape = new b2CircleShape();
		circleShape.m_radius = 0.1;
		this.fixtureDef.shape = circleShape;
	},
	send: function (event, message) {
		this.connection.send({
			t: event,
			d: message
		});
	},
	sendMap: function (map) {
		this.send(Constants.Types.Messages.Map, {
			tilesets: map.tilesets,
			layers: _.where(map.layers, function (layer) {
				return layer.type === "tilelayer";
			})
		});
	},
	move_up: function () {
		var self = this;
		this.animation = "walk_up";
		this.body.ApplyImpulse(new b2Vec2(0, -0.01), new b2Vec2(0, 0));
		this.scheduleAction(function () {
			self.animation = "idle_up";
		}, 250, this.id);
	},
	move_down: function () {
		var self = this;
		this.animation = "walk_down";
		this.body.ApplyImpulse(new b2Vec2(0, 0.01), new b2Vec2(0, 0));
		this.scheduleAction(function () {
			self.animation = "idle_down";
		}, 250, this.id);
	},
	move_left: function () {
		var self = this;
		this.animation = "walk_left";
		this.body.ApplyImpulse(new b2Vec2(-0.01, 0), new b2Vec2(0, 0));
		this.scheduleAction(function () {
			self.animation = "idle_left";
		}, 250, this.id);
	},
	move_right: function () {
		var self = this;
		this.animation = "walk_right";
		this.body.ApplyImpulse(new b2Vec2(0.01, 0), new b2Vec2(0, 0));
		this.scheduleAction(function () {
			self.animation = "idle_right";
		}, 250, this.id);
	},
	turn_cw: function () {

	},
	turn_ccw: function () {

	},
	onAction: function (data) {
		if (this.body === undefined) return false;
		if (data === "up") this.move_up();
		if (data === "down") this.move_down();
		if (data === "left") this.move_left();
		if (data === "right") this.move_right();
	},
	onAngle: function (data) {
		var self = this;
		if (this.body === undefined) return false;
		if (this.getAngle() > parseFloat(data)) this.scheduleAction(self.turn_cw, 0);
		else this.scheduleAction(self.turn_ccw, 0);
	}
});

return Player;