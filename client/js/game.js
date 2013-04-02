define(['renderer', 'player', 'gameclient', 'entityfactory'], 
	function(Renderer, Player, GameClient, EntityFactory) {
	var Game = Class.extend({
		init: function() {
			this.mouse = { x: 0, y: 0 };
			this.renderer = null;
			this.entities = [];
			this.keyboard = {};
			this.keybindings = {
				'w': this.moveUp.bind(this),
				's': this.moveDown.bind(this),
				'a': this.moveLeft.bind(this),
				'd': this.moveRight.bind(this)
			};
			this.host = window.location.hostname;
			this.port = 8000;
			this.playerId = null;
		},
		run: function() {
			this.camera = this.renderer.camera;
			this.tick();
		},
		tick: function() {
			this.currentTime = new Date().getTime();
			
			var self = this;

			this.renderer.renderFrame();
			_.each(this.keyboard, function(pressed, key) {  
				if (pressed)
					self.keybindings[key]();
			});
			var t = this.currentTime;
			_.each(this.entities, function(entity) {
				var anim = entity.currentAnimation;
                if(anim) {
                    anim.update(t);
                }
			});
			requestAnimFrame(this.tick.bind(this));
		},
		setup: function(canvas) {
			this.setRenderer(new Renderer(this, canvas));
		},
		setRenderer: function(renderer) {
			this.renderer = renderer;
		},
		connect: function() {
			var self = this;
			this.client = new GameClient(this.host, this.port);
			this.client.onWelcome(function(data) {
				self.playerId = data.playerId;
			});
			this.client.onEntityList(function(data) {
                var entities = {};
				for (var i = 0; i < data.length; i ++) {
					var entity_info = data[i];
					var kind = entity_info.kind;
					var id = entity_info.id;
					var entity = id in self.entities ? self.entities[id] : EntityFactory.createEntity(kind, id);
					entity.setAnimation(entity_info.animation);
					entity.setPosition(entity_info.position.x, entity_info.position.y);
					entity.setAngle(entity_info.angle);
					entities[id] = entity;
				}
				self.entities = entities;
			});
			this.client.connect();
		},
		moveCursor: function() {
			var angle = 0;
			return this.client.angle(angle);
		},
		moveUp: function() {
			return this.client.action('up');
		},
		moveDown: function() {
			return this.client.action('down');
		},
		moveLeft: function() {
			return this.client.action('left');
		},
		moveRight: function() {
			return this.client.action('right');
		},
	});

	return Game;

});