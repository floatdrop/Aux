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
			this.host = "localhost";
			this.port = 8000;
			this.playerId = null;
		},
		run: function() {
			this.camera = this.renderer.camera;
			this.tick();
		},
		tick: function() {
			var self = this;
			this.renderer.renderFrame();
			_.each(this.keyboard, function(pressed, key) {  
				if (pressed)
					self.keybindings[key]();
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
			this.entities[this.playerId].setAnimation("walk_up");
			return this.client.action('up');
		},
		moveDown: function() {
			this.entities[this.playerId].setAnimation("walk_down");
			return this.client.action('down');
		},
		moveLeft: function() {
			this.entities[this.playerId].flipSpriteX = true;
			this.entities[this.playerId].setAnimation("walk_right");
			return this.client.action('left');
		},
		moveRight: function() {
			this.entities[this.playerId].flipSpriteX = false;
			this.entities[this.playerId].setAnimation("walk_right");
			return this.client.action('right');
		},
	});

	return Game;

});