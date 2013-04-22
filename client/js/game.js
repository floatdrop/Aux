/* global _ */

define(['entities/player', 'client', 'entityfactory', 'map', 'view', 'entities/debugEntity'],

function (Player, Client, EntityFactory, Map, View, DebugEntity) {
	var Game = Class.extend({
		map: new Map(),

		init: function (renderer) {
			this.renderer = renderer;

			this.renderer.view.onmousemove = this.moveCursor.bind(this);
			this.keybindings['w'] = this.moveUp.bind(this);
			this.keybindings['s'] = this.moveDown.bind(this);
			this.keybindings['a'] = this.moveLeft.bind(this);
			this.keybindings['d'] = this.moveRight.bind(this);

			this.stage = new PIXI.Stage(0x000000);
			this.view = new View(this.renderer.width, this.renderer.height, 2048, 2048);

			this.canvas = document.createElement('canvas');
			this.canvas.width  = 800;
			this.canvas.height = 600;
			this.context = this.canvas.getContext('2d');
			this.debugSprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(this.canvas));

			this.stage.addChild(this.view);
		},
		run: function () {
			this.tick();
		},
		tick: function () {
			this.view.update();
			this.renderDebugEntities();
			this.renderer.render(this.stage);
			this._handleKeyboard();
			requestAnimFrame(this.tick.bind(this));
		},
		renderDebugEntities: function () {
			if (!this.context) return;
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			var self = this;
			_.each(self.entities, function (entity) {
				if (entity instanceof DebugEntity) {
					entity.draw(self.context);
				}
			});
			this.debugSprite.setTexture(PIXI.Texture.fromCanvas(this.canvas));
			this.stage.addChild(this.debugSprite);
		},
		_handleKeyboard: function () {
			var self = this;
			_.each(this.keyboard, function (pressed, key) {
				if (pressed) self.keybindings[key]();
			});
		},
		addToView: function (entity) {
			if (entity.isDisplayed()) {
				this.view.addChild(entity.getDisplayObject());
			}
		},
		connect: function () {
			var self = this;

			this.map.onMapLoaded(function () {
				self.view.setLimits(self.map.pixelwidth, self.map.pixelheight);
				_.each(self.map.getDisplayObjects(), function (displayObject) {
					self.view.addChild(displayObject);
				});
			});

			this.client = new Client(this.host, this.port);

			this.client.onWelcome(function (entity_info) {
				self.playerId = entity_info.id;
				self.player = EntityFactory.createEntity(entity_info, "PlayerName");
				self.entities[entity_info.id] = self.player;
				self.view.linkToEntity(self.player);
			});

			this.client.onMap(function (mapinfo) {
				self.map.load(mapinfo);
			});

			this.client.onEntityList(function (entitieslist) {
				self.entityList(entitieslist);
			});

			this.client.connect();
		},
		entityList: function (list) {
			var self = this;
			_.each(list, function (entity_info) {
				var id = entity_info.id;
				var entity = id in self.entities ? self.entities[id] : entity = EntityFactory.createEntity(entity_info, id);
				entity.update(entity_info);
				self.addToView(entity);
				self.entities[id] = entity;
			});
		},
		moveCursor: function (event) {
			if (this.player) {
				var angle = this.getAngle({x: event.x, y: event.y}, this.player.getPosition());
				var animation = this.getAnimation(angle);

				//this.player.animation.endsWith(animation)
				if (this.player.animation.substr(-animation.length) !== animation) {
					this.client.sendAngle(animation);
					console.log("send");
				}
			}
		},
		getAngle: function (center, point) {
			var x = point.x - center.x,
				y = point.y - center.y; 
			if (y === 0) {
				return (x > 0) ? 180 : 0;
			}
			var angle = Math.atan(x / y) * 180 / Math.PI; 
			return (y > 0) ? angle + 90 : angle + 270; 
		},
		getAnimation: function (angle) {
			if (angle > 315) return 'right';
			if (angle > 225) return 'down';
			if (angle > 135) return 'left';
			if (angle > 45) return 'up';
			return 'right';
		},
		moveUp: function () {
			return this.client.sendAction('up');
		},
		moveDown: function () {
			return this.client.sendAction('down');
		},
		moveLeft: function () {
			return this.client.sendAction('left');
		},
		moveRight: function () {
			return this.client.sendAction('right');
		},
		entities: {},
		keyboard: {},
		keybindings: {},
		mouse: {
			x: 0,
			y: 0
		},
		host: window.location.host,
		playerId: null
	});

	return Game;

});