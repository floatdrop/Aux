var Entity = require('../entity'),
	Box2D = require('../lib/box2d'),
	b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
	b2Vec2 = Box2D.Common.Math.b2Vec2,
	b2BodyDef = Box2D.Dynamics.b2BodyDef,
	b2Body = Box2D.Dynamics.b2Body,
	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

require('../../../client/js/constants');

var Bullet = module.exports = Entity.extend({
	init: function (id, player) {
		this._super(id, "bullet " + player.id, Constants.Types.Entities.Bullet);
		this.player = player;
		this.animation = "bullet";
		this.ttf = Bullet.TimeToFly;
		this.ttl = Bullet.TimeToLife;

		this.bodyDef = new b2BodyDef();
		this.bodyDef.type = b2Body.b2_dynamicBody;
		this.bodyDef.linearDamping = 0.2;

		this.fixtureDef = new b2FixtureDef();
		this.fixtureDef.filter.groupIndex = -2;
		var circleShape = new b2CircleShape();
		circleShape.m_radius = 0.01;
		this.fixtureDef.shape = circleShape;
	},
	update: function () {
		if (this.ttl <= 0) {
			this.remove_callback(this.id);
		}
		if (this.ttf <= 0) {
			this.animation = "blowing";
			this.body.SetLinearVelocity(new b2Vec2(0, 0));
			this.body.SetAngularVelocity(0);
			this.setAngle(0);
		}
		this.ttl -= 1;
		this.ttf -= 1;
	},
	getBaseState: function () {
		return {
			id: this.id,
			kind: this.kind,
			position: this.getPosition(),
			layer: this.layer,
			angle: this.animation === "blowing" ? 0 : -this.getAngle(),
			animation: this.animation
		};
	},
	onRemove: function (callback) {
		this.remove_callback = callback;
	},
	onCollision: function (contactBody) {
		if (contactBody.kind === Constants.Types.Entities.Player) {
			if (this.player.id === contactBody.id) {
				return false;
			}
			contactBody.shot();
		}
		if (contactBody.kind === Constants.Types.Entities.Bullet)
		{
			return false;
		}
		this.ttf = 0;
		return true;
	}
});

Bullet.TimeToLife = 100;
Bullet.TimeToFly = 40;
Bullet.DontHurtShootingPlayerTime = 40;
Bullet.SpeedRatio = 3;

return Bullet;