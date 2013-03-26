var cls = require("../lib/class");

module.exports = Barrel = cls.Class.extend({
	
	init: function(world, position) {
		this.physicBody = world.engine.createBarrel(position);
		this.id = world.gameObjects.length;
		world.gameObjects.push(this);
	},

	update: function() {
        var lv = this.physicBody.GetLinearVelocity();
        lv.Multiply(0.5)
        this.physicBody.SetLinearVelocity(lv);

        this.physicBody.SetAngularVelocity(0);
        this.physicBody.m_sweep.a = 0
		
		return {
				type: "barrel",
				id:this.id,
				position: this.physicBody.GetPosition()};
    },	
});