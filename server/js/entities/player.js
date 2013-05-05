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

var Player = module.exports = Entity.extend({
	init: function (connection, id, debug) {
		var self = this;
		this.connection = connection;
		this._super(id, "player", Constants.Types.Entities.PLAYER);
		this.heading = 0;
		this.angleEps = 90;
		this.debug = debug;
		this.animationType = "idle";
		this.setAnimation();
		this.entities_ids = [];
		this.layer = "objects";

		this.connection.listen(function (message) {
			self.callbacks[message.t](message.d);
		});

		this.callbacks = {};
		this.callbacks[Constants.Types.Messages.Action] = this.onAction.bind(this);
		this.callbacks[Constants.Types.Messages.Angle] = this.onAngle.bind(this);
		this.callbacks[Constants.Types.Messages.Shoot] = function (data) { self.shoot_callback(data); };
		this.bodyDef = new b2BodyDef();
		this.bodyDef.type = b2Body.b2_dynamicBody;
		this.bodyDef.linearDamping = 4;

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
	sendRemoveList: function (nonVisibleEntities, visibleEntities) {
		var nonVisible_ids = _.pluck(nonVisibleEntities, 'id');
		var visible_ids = _.pluck(visibleEntities, 'id');
		var remove_ids = _.union(nonVisible_ids, _.difference(this.entities_ids, visible_ids));
		if (_.isEmpty(remove_ids)) return;
		this.entities_ids = _.without(this.entities_ids, remove_ids);
		if (this.debug) {
			remove_ids = _.union(remove_ids, _.map(remove_ids, function (id) {
				return "debug-" + id;
			}));
		}
		this.send(Constants.Types.Messages.RemoveList, remove_ids);
	},
	sendEntities: function (entities) {
		var ids = _.pluck(entities, 'id');
		this.entities_ids = _.union(this.entities_ids, ids);
		if (this.debug) {
			entities = _.union(entities, _.map(entities, function (entity) {
				return EntityFactory.getShapeByEntity(entity);
			}));
		}
		this.send(Constants.Types.Messages.EntityList, _.map(entities, function (entity) {
			return entity.getBaseState();
		}));
	},
	sendMap: function (map) {
		this.send(Constants.Types.Messages.Map, {
			tilesets: map.json.tilesets,
			layers: _.where(map.json.layers, {
				type: "tilelayer"
			}),
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
	}
});

return Player;