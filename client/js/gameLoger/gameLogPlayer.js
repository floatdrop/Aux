/* global _ */

define(['jquery', '../entities/player', '../entities/trajectoryPoint'], function ($, Player, TrajectoryPoint) {

	var GameLogPlayer = Class.extend({
		init: function (game) {
			this.game = game;
			this.createButtons();
			this.rebindKeyboard();
			this.canvas = $('canvas')[0];
			this.cameraDelta = 25;

			//todo this.mapWidth = game.map.width;
			this.mapWidth = 60 * 32;
			this.mapHeight = 46 * 32;
			this.bottom = this.mapHeight - this.canvas.height;
			this.right = this.mapWidth - this.canvas.width;
		},

		createButtons: function () {
			var self = this,
				div = $('<div>');
				
			$('#content').append(div);
			$('<button>').text('Play').click(self.play.bind(self)).appendTo(div);
			$('<button>').text('Stop').click(self.stop.bind(self)).appendTo(div);
			$('<button>').text('Pause').click(self.pause.bind(self)).appendTo(div);
			$('<button>').text('ScreenShot').click(self.screenShot.bind(self)).appendTo(div);
		},

		rebindKeyboard: function () {
			LINK.Key.W.press(this.moveUp.bind(this));
			LINK.Key.S.press(this.moveDown.bind(this));
			LINK.Key.A.press(this.moveLeft.bind(this));
			LINK.Key.D.press(this.moveRight.bind(this));
		},

		moveUp: function () {
			if (this.game.camera.position.y < 0) {
				this.game.camera.position.y += this.cameraDelta;
			}
		},

		moveDown: function () {
			if (this.game.camera.position.y > -this.bottom) {
				this.game.camera.position.y -= this.cameraDelta;
			}
		},

		moveLeft: function () {
			if (this.game.camera.position.x < 0) {
				this.game.camera.position.x += this.cameraDelta;
			}
		},

		moveRight: function () {
			if (this.game.camera.position.x > -this.right) {
				this.game.camera.position.x -= this.cameraDelta;
			}
		},

		play: function () {
			this.game.client.sendGameLogerCommand(Constants.Types.GameLogerMsg.Play);
		},
		stop: function () {
			this.game.client.sendGameLogerCommand(Constants.Types.GameLogerMsg.Stop);
		},
		pause: function () {
			this.game.client.sendGameLogerCommand(Constants.Types.GameLogerMsg.Pause);
		},
		screenShot: function () {			
			var self = this;

			this.canvas.width = this.mapWidth;
			this.canvas.height = this.mapHeight;

			//wait some milleseconds while canvas resized
			setTimeout(function () {
				self.onCanvasResize();
			}, 300);
		},

		onCanvasResize: function () {
			var img = this.canvas.toDataURL("image/png");
			document.write('<img src="' + img + '"/>');
		},

		update: function () {
			var game = this.game;
			_.each(game.entities, function (entity) {
				if (entity instanceof Player) {
					var point = new TrajectoryPoint(),
					position = entity.getPosition();
					point.setPosition(position.x, position.y);
					point.animation.set("default").play();
					game.layers.game.tiles.objects.addChild(point.getDisplayObject());
				}
			});
		}
	});

	return GameLogPlayer;
});
