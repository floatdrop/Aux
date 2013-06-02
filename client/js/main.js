var $ = require('jquery');
require('klass');
window.Class = klass();
require('constants');
require('link');
require('lodash');

var Game = require('game');
var debug = false;

var renderer = PIXI.autoDetectRenderer(800, 600);
$("#content").append(renderer.view);

var game = new Game(renderer, debug);

$(function () {
	game.run();
});
