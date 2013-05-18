define(['jquery', 'game'], function ($, Game) {

	var debug = false;

	var renderer = PIXI.autoDetectRenderer(800, 600);
	$("#content").append(renderer.view);
	
	var game = new Game(renderer, debug);

	$(function () {
		game.connect();
		game.run();
	});

});