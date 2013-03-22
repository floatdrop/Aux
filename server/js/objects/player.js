var cls = require("../lib/class");

module.exports = Player = cls.Class.extend({
	
	init: function(world, sock) {
		socket = sock;
		this.physicBody = world.engine.createPlayerBody();
		this.id = world.gameObjects.length;
		physicBody = this.physicBody;
		var self = this;
		
		socket.on('pointerPosition', function (data) {
			self.heading = [
				data.x - self.physicBody.GetPosition().x,
				data.y - self.physicBody.GetPosition().y,
			];
		});
		
		socket.on('AkeyDown', function (data) {
			console.log(socket.id);
			var lv = physicBody.GetLinearVelocity();
			if (lv.x > -500)
				lv.x -= 50;
			physicBody.SetLinearVelocity(lv);
		});
    
		socket.on('DkeyDown', function (data) {
			var lv = physicBody.GetLinearVelocity();
			if (lv.x < 500)
				lv.x += 50;
			physicBody.SetLinearVelocity(lv);
		});

		socket.on('WkeyDown', function (data) {
			var lv = physicBody.GetLinearVelocity();
			if (lv.y > -500)
				lv.y -= 50;
			physicBody.SetLinearVelocity(lv);
		});
		
		socket.on('SkeyDown', function (data) {
			var lv = physicBody.GetLinearVelocity();
			if (lv.y < 500)
				lv.y += 50;
			physicBody.SetLinearVelocity(lv);
		});
	},

	update: function() {
        //physicBody.WakeUp();
        
        var lv = this.physicBody.GetLinearVelocity();
        lv.Multiply(0.75)
        this.physicBody.SetLinearVelocity(lv);
		this.updateAngle(lv);
		//console.log(this.action);
		
		return {id:this.id,position: this.physicBody.GetPosition(),action: this.action};
		//socket.emit("update",{id:id,position: physicBody.GetPosition()});
    },
	
	updateAngle: function(lv){
		var angle = (this.physicBody.GetAngle() * 180) / Math.PI;
        while (angle < 0) angle += 360;
		
        if (angle > -45 && angle <= 45)
            this.action = this.getAction(lv, "up");
        if (angle > 45 && angle <= 135)
            this.action = this.getAction(lv, "right");
        if (angle > 135 && angle <= 225)
            this.action = this.getAction(lv, "down");
        if (angle > 225 && angle <= 315)
            this.action = this.getAction(lv, "left");
        if (angle > 315)
            this.action = this.getAction(lv, "up");
        
		if (this.heading) {
			var pts = [this.heading[0] * Math.cos(this.physicBody.GetAngle()) + this.heading[1] * Math.sin(this.physicBody.GetAngle()), this.heading[0] * Math.sin(this.physicBody.GetAngle()) - this.heading[1] * Math.cos(this.physicBody.GetAngle())];
			this.heading = Math.atan2(pts[0], pts[1]);
		
            if (this.heading > 0.1) {
                this.physicBody.SetAngularVelocity(5);
            } else if (this.heading < -0.1) {
                this.physicBody.SetAngularVelocity(-5);
            } else {
                this.physicBody.SetAngularVelocity(0);
            }
        }
	},
	
	getAction: function(lv, direction)
    {
        if (Math.abs(lv.x) > 50 || Math.abs(lv.y) > 50)
            return "walk " + direction
        return "stand " + direction
    }
});