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
		this.heading = 0;
		this.angleEps = 90;
		this.animationType = "idle";
		this.setAnimation();

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
			tilesets: map.json.tilesets,
			layers: _.where(map.json.layers, {type: "tilelayer"}),
			width: map.json.width,
			height: map.json.height,
			tilewidth: map.json.tilewidth,
			tileheight: map.json.tileheight
		});
	},
	update: function () {
		var curAngle = this.getAngle(), 
			delta = curAngle - this.heading,
			sign = delta > 0 ? 1 : delta < 0 ? -1 : 0;
		
		if (Math.abs(delta) > 180) {
			curAngle -= sign * 360;
			sign *= -1;
		}
		curAngle -= Math.abs(delta) > this.angleEps ? sign * this.angleEps : delta;
		this.setAngle(curAngle);
		this.setAnimation();
	},
	setAnimation: function () {
		this.animation = this.animationType + "_" + this.getDirectionByAngle(this.getAngle());
	},
	move: function (impulse) {
		var self = this;
		this.body.ApplyImpulse(impulse, new b2Vec2(0, 0));
		this.animationType = "walk";
		this.scheduleAction(function () {
			self.animationType = "idle";
		}, 250, this.id);
	},
	onAction: function (data) {
		if (this.body === undefined) return false;
		if (data === "up") this.move(new b2Vec2(0, -0.01));
		if (data === "down") this.move(new b2Vec2(0, 0.01));
		if (data === "left") this.move(new b2Vec2(-0.01, 0));
		if (data === "right") this.move(new b2Vec2(0.01, 0));
	},
	onAngle: function (data) {
		var angle = parseInt(data, 10);
		if (isNaN(angle) || angle < 0 || angle > 360) {
			angle = 0;
		}
		this.heading = angle;
	},
	getDirectionByAngle: function (angle) {
		if (angle > 315) return 'right';
		if (angle > 225) return 'down';
		if (angle > 135) return 'left';
		if (angle > 45) return 'up';
		return 'right';
	}
});

return Player;