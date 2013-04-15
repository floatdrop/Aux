/* global _ */

define(['lib/async', 'tileset'], function (async, TileSet) {
	var Map = Class.extend({

		tilesets: [],
		layers: [],

		init: function () {},

		load: function (mapinfo) {
			this.tilewidth = mapinfo.tilewidth;
			this.tileheight = mapinfo.tileheight;
			this.layers = mapinfo.layers,
			this.width = mapinfo.width;
			this.height = mapinfo.height;
			this._loadTileSets(mapinfo.tilesets);
		},

		getDisplayObjects: function () {
			var self = this;
			var displayObjects = [];
			_.each(this.layers, function (layer) {
				displayObjects.push(self._layerToDisplayObjects(layer));
			});
			return displayObjects;
		},

		_layerToDisplayObjects: function (layer) {
			var self = this;
			var displayObject = new PIXI.DisplayObjectContainer();
			_.each(layer.data, function (tileindex, index) {
				if (tileindex <= 0) return;
				var tileSet = self.getTileSet(tileindex);
				var texture = tileSet.getTexture(tileindex);
				var tileSprite = new PIXI.Sprite(texture);
				tileSprite.position = new PIXI.Point(
					((index % layer.width) | 0) * self.tilewidth, 
					((index / layer.width) | 0) * self.tileheight);
				displayObject.addChild(tileSprite);
			});
			return displayObject;
		},

		getTileSet: function (tileindex) {
			return _.find(this.tilesets, function (tileset) {
				return tileset.firstindex <= tileindex && tileindex < tileset.lastindex;
			});
		},

		onMapLoaded: function (callback) {
			this.maploaded_callback = callback;
		},

		_loadTileSet: function (tileset, callback) {
			callback(null, new TileSet(tileset));
		},

		_loadTileSets: function (tilesets) {
			var self = this;

			/* This can be more beautiful */
			async.parallel(
			_.map(tilesets, function (tileset) {
				return function (callback) {
					self._loadTileSet(tileset, callback);
				};
			}),

			function (err, results) {
				self.tilesets = results;
				self.maploaded_callback(null, this);
			});
		}
	});
	return Map;
});