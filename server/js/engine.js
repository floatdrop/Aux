var Box2D = require('./box2d'),
	_ = require('underscore'),
	cls = require('./lib/class'),
	RectangleEntity = require('./rectangleEntity');

var b2Vec2 = Box2D.Common.Math.b2Vec2,
	b2World = Box2D.Dynamics.b2World;

var Engine = module.exports = cls.Class.extend({
	init: function (config) {
		this.b2w = new b2World(new b2Vec2(0, 0), false);
		this.entities = [];
		this.config = config;
	},
	tick: function (fps) {
		this.b2w.Step(1 / fps, 10, 10);
		this.b2w.ClearForces();
	},
	addEntity: function (entity) {
		entity.construct();
		entity.index = this.entities.length;
		this.entities.push(entity);
	},
	removeEntity: function (entity) {
		entity.destruct();
		this.entities.splice(entity.index, 1);
	},
	createShape: function (entity) {
		var id = this.entities.length;
		return new RectangleEntity(id, this.b2w, entity);
	},
	getEntities: function () {
		return this.entities;
	},
	dumpEntities: function () {
		var dump = [];
		if (this.config.drawDebug) {
			_.each(this.getEntities(), function (entity) {
				dump.push(entity.getBaseState());
				// dump.push(entity.getShapeEntity().getBaseState());
			});
		} else {
			_.each(this.getEntities(), function (entity) {
				dump.push(entity.getBaseState());
			});
		}
		return dump;
	}
});

return Engine;