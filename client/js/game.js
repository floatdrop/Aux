define(['renderer', 'player', 'lib/underscore.min', 'gameclient'], 
	function(Renderer, Player, _, GameClient) {
	var Game = Class.extend({
		init: function() {
			this.mouse = { x: 0, y: 0 };
			this.renderer = null;
			this.entities = [];
			this.host = "localhost";
			this.port = 8000;
			this.player = new Player("player", "");
		},
		run: function() {
			this.setUpdater(new Updater(this));
			this.camera = this.renderer.camera;
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
			this.client.onEntityList(function(list) {
				this.entities = list;
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