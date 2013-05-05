var Entity = require('../entity'),
	Box2D = require('../lib/box2d'),
	b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
	b2BodyDef = Box2D.Dynamics.b2BodyDef,
	b2Body = Box2D.Dynamics.b2Body,
	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

require('../../../client/js/constants');

var Bullet = module.exports = Entity.extend({
	init: function (id, player) {
		this._super(id, "bullet " + player.id, Constants.Types.Entities.Bullet);
		this.player = player;
		this.ttl = Bullet.TimeToLife;

		this.bodyDef = new b2BodyDef();
		this.bodyDef.type = b2Body.b2_dynamicBody;
		this.bodyDef.linearDamping = 0.5;

		this.fixtureDef = new b2FixtureDef();

		var circleShape = new b2CircleShape();
		circleShape.m_radius = 0.03;
		this.fixtureDef.shape = circleShape;
	},
	update: function () {
		if (this.ttl-- <= 0) {
			this.remove_callback(this.id);
		}
	},
	getBaseState: function () {
		return {
			id: this.id,
			kind: this.kind,
			position: this.getPosition(),
			layer: this.layer
		};
	},
	onRemove: function (callback) {
		this.remove_callback = callback;
	},
	onCollision: function (contactBody) {
		if (contactBody.kind !== Constants.Types.Entities.PLAYER) return true;
		if (Bullet.TimeToLife - this.ttl < Bullet.DontHurtShootingPlayerTime &&
			this.player.id === contactBody.id) {
			return false;
		}
		console.log("kill " + contactBody.type);
		return true;
	}
});

Bullet.TimeToLife = 150;
Bullet.DontHurtShootingPlayerTime = 10;
Bullet.SpeedRatio = 3;

return Bullet;