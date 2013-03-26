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
            if (this.game.map.isLoaded)
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

        },

        //TODO REMOVE if (data.layers[i].visible) !!!!!!!!
        //Сделать разбиение map на clientMap, serverMap
        drawMap: function(map){
            var data = map.data;
            for (var i=0;i<data.layers.length;i++){
                if (data.layers[i].visible)
                    this.drawLayer(map.tiles[0], data.layers[i]);
            }  
        },

        drawLayer: function(tileSet, layer){
            for (var i=0;i<layer.data.length;i++){
                if (layer.data[i] !== 0)
                    this.drawTile(tileSet, i, layer.data[i], layer.width);
            }
        },

        drawScaledImage: function(image, x, y, w, h, dx, dy) {
            var s = 1;
        
            this.context.drawImage(image,
                          x * s,
                          y * s,
                          w * s,
                          h * s,
                          dx * s,
                          dy * s,
                          w * s,
                          h * s);
        },

        drawTile: function(tileSet, tileid, tileValue, mapWidth) {
            this.drawScaledImage(tileSet.image,
                            ((tileValue - 1) % tileSet.width)*tileSet.tileWidth,
                            Math.floor(tileValue / tileSet.width) * tileSet.tileHeight,
                            tileSet.tileWidth,
                            tileSet.tileHeight,
                            (tileid % mapWidth)*tileSet.tileWidth,
                            Math.floor(tileid / mapWidth)*tileSet.tileHeight
                            );
        },
	});
	return Renderer;
});