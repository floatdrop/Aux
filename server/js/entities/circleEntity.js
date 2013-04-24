var Entity = require('../entity'),
	Box2D = require('../lib/box2d'),
	b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
	b2BodyDef = Box2D.Dynamics.b2BodyDef,
	b2Body = Box2D.Dynamics.b2Body,
	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

require('../../../client/js/constants');

var CircleEntity = module.exports = Entity.extend({
	init: function (id, radius) {
		this._super(id, "CircleEntity", Constants.Types.Entities.CircleEntity);

		var fixDef = new b2FixtureDef();
		fixDef.density = 1.5;
		fixDef.friction = 1;
		fixDef.restitution = 1;

		this.bodyDef = new b2BodyDef();
		this.bodyDef.type = b2Body.b2_staticBody;
		this.bodyDef.linearDamping = 4;

		fixDef.shape = new b2CircleShape();
		fixDef.shape.SetRadius(radius);

		this.fixtureDef = fixDef;

	},

	getBaseState: function () {
		return {
			position: this.getPosition(),
			radius: this.shape.GetRadius(),
			kind: this.kind,
			id: this.id
		};
	}
});

return CircleEntity;