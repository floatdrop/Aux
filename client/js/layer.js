define(function () {
	var Layer = Class.extend({
		init: function (layer_info) {
			this.data = layer_info.data;
			this.width = layer_info.width;
			this.height = layer_info.height;
			this.name = layer_info.name;
			this.x = layer_info.x;
			this.y = layer_info.y;
		}
	});

	return Layer;
});