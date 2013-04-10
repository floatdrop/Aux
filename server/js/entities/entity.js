var cls = require("../lib/class"),
	_ = require("underscore"),
	Box2D = require('../lib/box2d');

var actions = {};
var b2BodyDef = Box2D.Dynamics.b2BodyDef,
	b2Body = Box2D.Dynamics.b2Body,
	b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;

var GLOBAL_ID_COUNTER = 0;

var Entity = module.exports = cls.Class.extend({
	init: function (id, world, type, kind) {
		this.setId(id);
		this.world = world;
		this.type = type;
		this.kind = kind;
		this.position = {x: 0, y: 0};
		this.angle = 0;
		this.animation = null;
	},
	setId: function (id) {
		if (id === null) {
			GLOBAL_ID_COUNTER ++;
			this.id = GLOBAL_ID_COUNTER;
		} else {
			this.id = id;
		}
	},
	setPosition: function (x, y) {
		this.position.x = x;
		this.position.y = y;
	},
	getPosition: function () {
		return { x: this.position.x, y: this.position.y};
	},
	setAngle: function (a) {
		this.angle = a;
	},
	getAngle: function () {
		return this.angle;
	},
	construct: function () {

	},
	destruct: function () {

	},
	scheduleAction: function (action, timeout, id) {
		if (timeout <= 0)
			process.nextTick(action);
		else {
			if (id in actions)
				clearTimeout(actions[id]);
			var timeoutId = setTimeout(action, timeout);
			if (id)
				actions[id] = timeoutId;
		}
	},
	getBaseState: function () {
		return {
			id: this.id,
			kind: this.kind,
			position: this.getPosition(),
			angle: this.getAngle(),
			animation: this.animation
		};
	},

	getShapeEntity: function () {
		var shape = this.fixture.m_shape;
		var id = "debug-" + this.id;
		if (shape.m_type === 1)
			return this.getPolygonEntity(id, shape);
		if (shape.m_type === 0)
			return this.getCircleEntity(id, shape);
	},

	getCircleEntity: function (id, shape) {
		return {
			position: this.getPosition(),
			radius: shape.m_radius,
			kind: Constants.Types.Entities.CircleEntity,
			id: id
		};
	},

	getPolygonEntity: function (id, shape) {
		return {
			position: this.getPosition(),
			vertices: shape.m_vertices,
			kind: Constants.Types.Entities.PolygonEntity,
			id: id
		};
	}
});

return Entity;