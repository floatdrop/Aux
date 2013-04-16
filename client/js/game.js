/* global _ */

define(['renderer', 'player', 'gameclient', 'entityfactory', 'map'],

		init: function (renderer) {
			this.renderer = renderer;

			this.keybindings['w'] = this.moveUp.bind(this);
			this.keybindings['s'] = this.moveDown.bind(this);
			this.keybindings['a'] = this.moveLeft.bind(this);
			this.keybindings['d'] = this.moveRight.bind(this);
		},
		run: function () {
			this.camera = this.renderer.camera;
			this.tick();
		},
		tick: function () {
			this.renderer.render(this.stage);
			this._handleKeyboard();
			requestAnimFrame(this.tick.bind(this));
		},
		_handleKeyboard: function () {
			var self = this;
			_.each(this.keyboard, function (pressed, key) {
				if (pressed) self.keybindings[key]();
			});
		},
		connect: function () {
			var self = this;

			this.map.onMapLoaded(function () {
				_.each(self.map.getDisplayObjects(), function (displayObject) {
					self.stage.addChild(displayObject);
				});
			});

			this.client = new Client(this.host, this.port);

			this.client.onWelcome(function (data) {
				self.playerId = data.playerId;
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
			var entities = {};
			var self = this;
			_.each(list, function (entity_info) {
				var id = entity_info.id;
				var entity = id in self.entities ? self.entities[id] : entity = EntityFactory.createEntity(entity_info, id);
				entity.update(entity_info);
				if (entity.isAnimated()) self.stage.addChild(entity.getDisplayObject());
				entities[id] = entity;
			});
			this.entities = entities;
		},
		moveCursor: function () {
			//var angle = 0;
			//return this.client.sendAngle(angle);
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
		stage: new PIXI.Stage(0x000000),
		entities: [],
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