/* global _ */

define(['renderer', 'player', 'gameclient', 'entityfactory', 'map'],

function (Renderer, Player, GameClient, EntityFactory, Map) {
	var Game = Class.extend({
		init: function () {
			this.mouse = {
				x: 0,
				y: 0
			};
			this.renderer = null;
			this.player = null;
			this.entities = [];
			this.keyboard = {};
			this.keybindings = {
				'w': this.moveUp.bind(this),
				's': this.moveDown.bind(this),
				'a': this.moveLeft.bind(this),
				'd': this.moveRight.bind(this)
			};
			this.host = window.location.hostname;
			this.playerId = null;
		},
		run: function () {
			this.camera = this.renderer.camera;
			this.tick();
		},
		tick: function () {
			this.currentTime = new Date().getTime();

			var self = this,
				t = this.currentTime;

			this.renderer.renderFrame();
			_.each(this.keyboard, function (pressed, key) {
				if (pressed) self.keybindings[key]();
			});

			_.each(this.entities, function (entity) {
				var anim = entity.currentAnimation;
				if (anim) {
					anim.update(t);
				}
			});
			requestAnimFrame(this.tick.bind(this));
		},
		setup: function (canvas) {
			this.setRenderer(new Renderer(this, canvas));
		},
		setRenderer: function (renderer) {
			this.renderer = renderer;
		},
		connect: function () {
			var self = this;
			this.client = new GameClient(this.host, this.port);
			this.map = new Map(this);
			this.client.onWelcome(function (entity_info) {
				self.playerId = entity_info.id;
				self.player = EntityFactory.createEntity(entity_info, "PlayerName");
				self.entities.push(self.player);
			});
			this.client.onMap(function (data) {
				self.map.onMapLoaded(data);
			});
			this.client.onEntityList(function (data) {
				var entities = {};
				_.each(data, function (entity_info) {
					var id = entity_info.id,
						entity = id in self.entities ? self.entities[id] : 
														EntityFactory.createEntity(entity_info, id);
					entity.update(entity_info);
					entities[id] = entity;
				});
				self.entities = entities;
			});
			this.client.connect();
		},
		moveCursor: function () {
			var angle = 0;
			return this.client.angle(angle);
		},
		moveUp: function () {
			return this.client.action('up');
		},
		moveDown: function () {
			return this.client.action('down');
		},
		moveLeft: function () {
			return this.client.action('left');
		},
		moveRight: function () {
			return this.client.action('right');
		},
	});

	return Game;

});