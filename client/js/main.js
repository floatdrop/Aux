define(['jquery', 'game'], function ($, Game) {

	var debug = false;

	var renderer = PIXI.autoDetectRenderer(800, 600);
	document.body.appendChild(renderer.view);
	
	var game = new Game(renderer, debug);

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

	$(function () {
		game.connect();
		game.run();
	});

});