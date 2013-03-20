define(['jquery', 'game'], function($, Game) {

	var canvas = document.getElementById("gamecanvas");
	var game = new Game();
	game.setup(canvas);

	$(document).mousemove(function(event) {
		var gamePos = $('#gamecanvas').offset(),
				mouse = game.mouse;

		mouse.x = event.pageX - gamePos.left;
    mouse.y = event.pageY - gamePos.top;

  	game.moveCursor();
  });

	$(document).bind("keydown", function(e) {
			var key = e.which;
			if (key === 87) { // W
				game.moveUp();
				return false;
			}
			if (key === 83) { // S
				game.moveDown();
				return false;
			}
			if (key === 65) { // A
				game.moveLeft();
				return false;
			}
			if (key === 68) { // D
				game.moveRight();
				return false;
			}
	});

	game.connect();

});