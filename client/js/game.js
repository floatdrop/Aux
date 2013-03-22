define(['renderer', 'player', 'gameclient'], 
	function(Renderer, Player, GameClient) {
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
			this.player = new Player("player", "");
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
			this.client.onEntityList(function(data) {
				self.entities = data;
			});
			this.client.connect();
		},
		moveCursor: function() {
			var angle = 0;
			return this.client.angle(angle);
		},
		moveUp: function() {
			this.player.setAnimation("walk_up");
			return this.client.action('up');
		},
		moveDown: function() {
			this.player.setAnimation("walk_down");
			return this.client.action('down');
		},
		moveLeft: function() {
			this.player.flipSpriteX = true;
			this.player.setAnimation("walk_right");
			return this.client.action('left');
		},
		moveRight: function() {
			this.player.setAnimation("walk_right");
			return this.client.action('right');
		},
	});

	return Game;

});