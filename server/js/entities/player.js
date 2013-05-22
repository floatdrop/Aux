var Box2D = require('../lib/box2d'),
	Entity = require('../entity'),
	log = require('../log'),
	_ = require('underscore'),
	EntityFactory = require('../entityFactory');

require('../../../client/js/constants');

var b2BodyDef = Box2D.Dynamics.b2BodyDef,
	b2Body = Box2D.Dynamics.b2Body,
	b2Vec2 = Box2D.Common.Math.b2Vec2,
	b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

var logger = require("./../gamelogger");

var Player = module.exports = Entity.extend({
	init: function (connection, id, debug) {
		var self = this;
		this.connection = connection;
		this._super(id, "player", Constants.Types.Entities.Player);
		this.heading = 0;
		this.angleEps = 90;
		this.debug = debug;
		this.setAnimation();
		this.entities_ids = [];
		this.layer = "objects";
		this.health = 1;
		this.bullets = 10;
		this.animationType = this.health <= 0 ? "ghost" : "idle";

		this.connection.listen(function (message) {
			logger.write(self.connection, new Buffer(JSON.stringify(message)), logger.MsgType.Action);
			self.callbacks[message.t](message.d);
		});
		this.bindCallbacks();
		this.createBody();
	},
	shot: function () {
		this.health -= 1;
		if (this.health <= 0) {
			this.animationType = "ghost";
			this.bullets = 0;
		}
	},
	bindCallbacks: function () {
		var self = this;
		this.callbacks = {};
		this.callbacks[Constants.Types.Messages.Action] = this.onAction.bind(this);
		this.callbacks[Constants.Types.Messages.Angle] = this.onAngle.bind(this);
		this.callbacks[Constants.Types.Messages.Shoot] = function (data) { self.shoot_callback(data); };
	},
	createBody: function () {
		this.bodyDef = new b2BodyDef();
		this.bodyDef.type = b2Body.b2_dynamicBody;
		this.bodyDef.linearDamping = 4.5;

		this.fixtureDef = new b2FixtureDef();
		this.fixtureDef.density = 5;
		this.fixtureDef.friction = 0.01;
		this.fixtureDef.restitution = 1;
		var circleShape = new b2CircleShape();
		circleShape.m_radius = 0.05;
		this.fixtureDef.shape = circleShape;
	},
	send: function (event, message) {
		this.connection.send({
			t: event,
			d: message
		});
	},
	sendEntities: function (entities) {
		var ids = _.pluck(entities, 'id');
		this.entities_ids = ids;
		if (!this.debug) {
			entities = _.union(entities, _.map(_.filter(entities, function (entity) {
				return entity.debuggable === true;
			}), function (entity) {
				return EntityFactory.getShapeByEntity(entity);
			}));
		}
		this.send(Constants.Types.Messages.EntityList, _.map(entities, function (entity) {
			return entity.getBaseState();
		}));
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
		this.animationType = this.health <= 0 ? "ghost" : "walk";
		this.scheduleAction(function () {
			self.animationType = self.health <= 0 ? "ghost" : "idle";
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
			log.warn("For player " + this.id + " angle is " + angle);
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
	},
	onShoot: function (callback) {
		this.shoot_callback = callback;
	},
	getBaseState: function () {
		return {
			id: this.id,
			kind: this.kind,
			position: this.getPosition(),
			//angle: this.getAngle(),
			animation: this.animation,
			layer: this.layer,
			health: this.health,
			bullets: this.bullets
		};
	}
});

return Player;