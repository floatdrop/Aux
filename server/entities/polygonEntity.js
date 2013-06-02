var Entity = require('./entity'),
	Box2D = require('../vendor/box2d'),
	b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
	b2BodyDef = Box2D.Dynamics.b2BodyDef,
	b2Body = Box2D.Dynamics.b2Body,
	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;

require('../../client/js/constants');

var PolygonEntity = module.exports = Entity.extend({
	initialize: function (id, points) {
		this.supr(id, "PolygonEntity", Constants.Types.Entities.PolygonEntity);

		this.points = points;

		var fixDef = new b2FixtureDef();
		fixDef.density = 15;
		fixDef.friction = 1;
		fixDef.restitution = 1;

		fixDef.shape = new b2PolygonShape();
		if (points) {
			fixDef.shape.SetAsArray(points);
		}

		this.fixtureDef = fixDef;

		this.bodyDef = new b2BodyDef();
		this.bodyDef.type = b2Body.b2_staticBody;
		this.bodyDef.linearDamping = 4;

	},

	getBaseState: function () {
		return {
			position: this.position,
			points: this.points,
			kind: this.kind,
			id: this.id,
			layer: this.layer
		};
	}
});

return PolygonEntity;