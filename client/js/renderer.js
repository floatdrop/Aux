define([], function() {
	var Renderer = Class.extend({
		init: function(game, canvas) {
            this.debug = true;
			this.scale = 1;
			this.game = game;
			this.canvas = canvas;
			this.context = (canvas && canvas.getContext) ? canvas.getContext("2d") : null;
		},
		renderFrame: function() {
			var self = this;
			this.clearScreen(this.context);
			var entities = _.sortBy(this.game.entities, function(e) { return e.y; });
			_.each(entities, function(entity) {
				if (self.debug) {
					self.debugDrawEntity(entity);
				} else {
					self.drawEntity(entity);
				}
			});
		},
		clearScreen: function(ctx) {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        },
        debugDrawEntity: function(entity) {
        	var os = 1;
        	var x = entity.x * this.scale,
                y = entity.y * this.scale;
            var ctx = this.context;
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI*2, true); 
            ctx.closePath();
            ctx.fill();
        },
        drawEntity: function(entity) {
        	var os = 1,
        		ds = 1;
        	var sprite = entity.sprite,
        		anim = entity.currentAnimation;
        	var	frame = anim.currentFrame,
                    x = frame.x * os,
                    y = frame.y * os,
                    w = sprite.width * os,
                    h = sprite.height * os,
                    ox = sprite.offsetX * s,
                    oy = sprite.offsetY * s,
                    dx = entity.x * s,
                    dy = entity.y * s,
                    dw = w * ds,
                    dh = h * ds;
        	this.context.drawImage(sprite.image, x, y, w, h, ox, oy, dw, dh);
        }
	});
	return Renderer;
});