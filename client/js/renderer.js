define([], function() {
	var Renderer = Class.extend({
		init: function(game, canvas) {
            this.debug = false;
			this.scale = 100;
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
        	var x = entity.position.x * this.scale,
                y = entity.position.y * this.scale,
				width = entity.width * this.scale,
				heigth = entity.heigth * this.scale;
			var ctx = this.context;
			ctx.fillStyle = "rgb(0, 0, 0)";
			ctx.fillRect(x - width/2, y - heigth/2, width, heigth);
			ctx.fillStyle = "rgb(255, 0, 0)";
			ctx.fillText(entity.type, x, y);			
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
                    ox = sprite.offsetX * 1,
                    oy = sprite.offsetY * 1,
                    dx = entity.x * this.scale,
                    dy = entity.y * this.scale,
                    dw = w * ds,
                    dh = h * ds;

                this.context.save();
                if(anim.flipSpriteX) {
                    this.context.translate(dx + dw / 2, dy);
                    this.context.scale(-1, 1);
                }
                else if(anim.flipSpriteY) {
                    this.context.translate(dx, dy + dh);
                    this.context.scale(1, -1);
                }
                else {
                    this.context.translate(dx, dy);
                }

        	this.context.drawImage(sprite.image, x, y, w, h, ox, oy, dw, dh);

            this.context.restore();

        }
	});
	return Renderer;
});