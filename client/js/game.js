/* global _ */

define(['entities/player', 'client', 'entityfactory', 'entities/debugEntity'],

function (Player, Client, EntityFactory, DebugEntity) {
	var Game = Class.extend({

		init: function (renderer) {
			this.renderer = renderer;

			/* BIND MOUSE */
			this.mouse = new LINK.Mouse(this.renderer.view);
			this.mouse.on.down(this.shoot.bind(this));
			this.mouse.on.move(this.moveCursor.bind(this));

			/* BIND KEYBOARD */
			LINK.Key.W.press(this.moveUp.bind(this));
			LINK.Key.S.press(this.moveDown.bind(this));
			LINK.Key.A.press(this.moveLeft.bind(this));
			LINK.Key.D.press(this.moveRight.bind(this));

			/* CREATE STAGE */
			this.stage = new PIXI.Stage(0x000000);
			this.layers = new LINK.Layers({
				"game": new LINK.Layers({
					"tiles": new LINK.TiledMap('assets/world/smallworld.json'),
					"objects": new LINK.Layers()
				})
			}, "debug", "ui");
			this.stage.addChild(this.layers);

			/* DROP CAMERA */
			this.camera = new LINK.Camera(800, 600);
			this.camera.on(this.layers.game);
			this.camera.bounds = new PIXI.Rectangle(0, 0, 1920, 1472);

			LINK.Stats.on(this.stage);

			/* DEBUG ELEMENT */
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
			LINK.Key.runCallbacks();
			this.renderDebugEntities();
			this.renderer.render(this.stage);
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
		connect: function () {
			var self = this;

			this.client = new Client(this.host, this.port);

			this.client.onWelcome(function (entity_info) {
				self.playerId = entity_info.id;
				self.player = EntityFactory.createEntity(entity_info, "PlayerName");
				self.entities[entity_info.id] = self.player;
				self.camera.follow(self.player.getDisplayObject());
			});

			this.client.onEntityList(function (entitieslist) {
				self.entityList(entitieslist);
			});

			this.client.connect();
		},
		entityList: function (list) {
			var self = this;
			_.each(list, function (info) {
				var id = info.id;
				var entity = id in self.entities ? self.entities[id] : entity = EntityFactory.createEntity(info, id);
				entity.update(info);
				self.layers.game.tiles.objects.addChild(entity.getDisplayObject());
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
			var offset = this.camera.position,
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