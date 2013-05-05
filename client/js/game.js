/* global _ */

define(['entities/player', 'client', 'entityfactory', 'map', 'view', 'entities/debugEntity'],

function (Player, Client, EntityFactory, Map, View, DebugEntity) {
	var Game = Class.extend({
		map: new Map(),

		init: function (renderer) {
			this.renderer = renderer;

			this.renderer.view.onmousedown = this.shoot.bind(this);
			this.renderer.view.onmousemove = this.moveCursor.bind(this);
			this.keybindings['w'] = this.moveUp.bind(this);
			this.keybindings['s'] = this.moveDown.bind(this);
			this.keybindings['a'] = this.moveLeft.bind(this);
			this.keybindings['d'] = this.moveRight.bind(this);

			this.stage = new PIXI.Stage(0x000000);
			this.layers = new PIXI.Layers("game", "debug", "ui");
			this.stage.addChild(this.layers);

			this.view = new View(this.renderer.width, this.renderer.height);
			this.layers.game.addChild(this.view);

			this.view.layers = new PIXI.Layers("tiles", "default", "objects");
			this.view.addChild(this.view.layers);

			this.canvas = document.createElement('canvas');
			this.canvas.width = this.renderer.width;
			this.canvas.height = this.renderer.height;
			this.context = this.canvas.getContext('2d');
			this.debugSprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(this.canvas));
			this.layers.debug.addChild(this.debugSprite);
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
		},
		_handleKeyboard: function () {
			var self = this;
			_.each(this.keyboard, function (pressed, key) {
				if (pressed) self.keybindings[key]();
			});
		},
		removeFromView: function (entity) {
			var obj = entity.getDisplayObject();
			if (obj && this.view.layers[entity.layer]) {
				this.view.layers[entity.layer].removeChild(obj);
			}
		},
		addToView: function (entity) {
			var obj = entity.getDisplayObject();
			if (obj) {
				this.view.layers[entity.layer].addChild(obj);
			}
		},
		connect: function () {
			var self = this;

			this.map.onMapLoaded(function () {
				self.view.setLimits(self.map.pixelwidth, self.map.pixelheight);
				_.each(self.map.getDisplayObjects(), function (displayObject) {
					self.view.layers.tiles.addChild(displayObject);
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

			this.client.onRemoveList(function (idsList) {
				self.removeList(idsList);
			});

			this.client.connect();
		},
		removeList: function (list) {
			var self = this;
			_.each(list, function (id) {
				if (self.entities[id]) {
					self.removeFromView(self.entities[id]);
					delete self.entities[id];
				}
			});
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
				var angle = this.getAngle({
					x: event.x,
					y: event.y
				}, this.player.getPosition());
				this.client.sendAngle(parseInt(angle, 10));
			}
		},
		getAngle: function (cursor, point) {
			var offset = this.view.position,
				originalCursor = {
					x: cursor.x - offset.x,
					y: cursor.y - offset.y
				};

			var x = point.x - originalCursor.x,
				y = point.y - originalCursor.y;
			if (y === 0) {
				return (x > 0) ? 180 : 0;
			}
			var angle = Math.atan(x / y) * 180 / Math.PI;
			return (y > 0) ? angle + 90 : angle + 270;
		},
		shoot: function () {
			this.client.sendShoot();
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