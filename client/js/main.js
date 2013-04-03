define(['jquery', 'game'], function ($, Game) {

	var canvas = document.getElementById("gamecanvas"),
		game = new Game();
	game.setup(canvas);

	$(document).mousemove(function (event) {
		var gamePos = $('#gamecanvas').offset(),
			mouse = game.mouse;

		mouse.x = event.pageX - gamePos.left;
		mouse.y = event.pageY - gamePos.top;

		game.moveCursor();
	});

	$(document).bind("keydown", function (e) {
		var key = e.which;
		if (key === 87) game.keyboard['w'] = true;
		if (key === 83) game.keyboard['s'] = true;
		if (key === 65) game.keyboard['a'] = true;
		if (key === 68) game.keyboard['d'] = true;
	});

	$(document).bind("keyup", function (e) {
		var key = e.which;
		if (key === 87) game.keyboard['w'] = false;
		if (key === 83) game.keyboard['s'] = false;
		if (key === 65) game.keyboard['a'] = false;
		if (key === 68) game.keyboard['d'] = false;
	});

	game.connect();
	game.run();

});