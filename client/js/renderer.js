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
			this.drawMap(this.game.map);
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
                    dx = entity.x * this.scale - sprite.width / 2,
                    dy = entity.y * this.scale - sprite.height,
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

        },
		drawMap: function(map) {
			// if (!map.isLoaded)
				// return;
			for (var i=0;i<map.layers.length;i++)
				if (map.layers[i].visible)
					this.drawLayer(map, map.layers[i]);
		},
		drawLayer: function(map, layer){
			var countTiles = layer.width * layer.height;
			for (var i=0;i<countTiles;i++){
				if (layer.data[i] !== 0)
					this.drawTile(map, i, layer.data[i], layer.x, layer.y);
			}
		},
		drawTile: function(map, index, value, offsetX, offsetY){
			var tileSet = map.getTileSet(value);
			var tileW = tileSet.tileWidth,
				tileH = tileSet.tileHeight,
				x = ((value - 1) % tileSet.width) * tileW,
				y = Math.floor(value / tileSet.width) * tileH,
				dx = (index % map.width) * tileW,
				dy = Math.floor(index / map.width) * tileH;
				
			this.context.drawImage(tileSet.image, x, y, tileW, tileH, dx, dy, tileW, tileH);
		}
	});
	return Renderer;
});