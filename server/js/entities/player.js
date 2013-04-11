var Box2D = require('../lib/box2d'),
	Entity = require('./entity'),
	BISON = require('bison');

require('../../../client/js/constants');

var b2BodyDef = Box2D.Dynamics.b2BodyDef,
	b2Body = Box2D.Dynamics.b2Body,
	b2Vec2 = Box2D.Common.Math.b2Vec2,
	b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

var Player = module.exports = Entity.extend({
	init: function (socket, id, world) {
		var self = this;
		this.socket = socket;
		this._super(id, "player", Constants.Types.Entities.PLAYER);
		this.world = world;

		this.socket.emit("welcome", {
			playerId: this.socket.id
		});
		this.animation = "idle_right";

		this.socket.on('action', function (data) {
			self.onAction(data);
		});
		this.socket.on('angle', function (data) {
			self.onAngle(data);
		});

		this.bodyDef = new b2BodyDef();
		this.bodyDef.type = b2Body.b2_dynamicBody;
		this.bodyDef.position = this.position;
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
		message = { t: event, d: message };

		// Encode packet with BiSON to safe up to 50% against JSON.stringify
		var bisonPacket = BISON.encode(message);

		// A tricky part is that you will get nothing sending data as-is.
		// Our bison string is build of chars with indexes from 0 to 255.
		// utf-8 uses extra byte to encode char beyond index 127 so u will end up
		// sending value which can be represented by one byte in two bytes.
		// To take advantage of binary transport we will have to convert our data
		// to javascript typed array. Unsigned Int 8 will do best.

		var uint8Packet = new Uint8Array(bisonPacket.length);

		for (var i = 0, len = bisonPacket.length; i < len; i++) {
			uint8Packet[i] = bisonPacket.charCodeAt(i);
		}

		// This is how sending binary data looks like with ws library
		this.socket.send(uint8Packet);
	},
	construct: function () {
		this.body = this.world.CreateBody(this.bodyDef);
		this.body.m_userData = this;
		this.fixture = this.body.CreateFixture(this.fixtureDef);
		this.getPosition = function () {
			return this.body.GetPosition();
		};
		this.setPosition = function (x, y) {
			this.body.SetPosition(new b2Vec2(x, y));
		};
		this.getAngle = function () {
			return this.body.GetAngle();
		};
		this.setAngle = function (a) {
			this.body.SetAngle(a);
		};
	},
	destruct: function () {
		this.world.DestroyBody(this.body);
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