var cls = require("./lib/class"),
	_ = require("underscore"),
	Log = require("log"),
	async = require("async"),
	Engine = require("./engine"),
	Player = require("./objects/player");
	
module.exports = World = cls.Class.extend({
	
	init: function() {
		this.ups = 50;
		this.gameObjects = [];
		this.sockets = [];
		this.onPlayerConnect(function(socket) {
			this.sockets.push(socket);
			var player = new Player(this, socket);
            this.gameObjects.push(player);
			//console.log(player.id);
        });
		this.engine = new Engine(1000 / this.ups);
	},

	run: function() {
		var self = this;
		setInterval(function () {
			worldState = [];
			self.engine.update();
			
			for (var i=0;i<self.gameObjects.length;i++){
				var json = self.gameObjects[i].update();
				//console.log(json.id);
				if (json)
					worldState.push(json);
			}
						
			if (worldState.length > 0){
				//console.log(worldState);
				for (var i=0;i<self.sockets.length;i++)
					self.sockets[i].emit('update',worldState);
			}
			// async.map(self.gameObjects, function(gameObject, callback) {
				// var json = gameObject.update();
				// console.log(json);
				// if (json)
					// worldState.push(json);
				// callback(null,worldState);
			// }, function (err,worldState){
				// console.log(worldState);
				// if (worldState.length > 0){
					// for (var i=0;i<self.sockets.length;i++)
						// self.sockets[i].emit('update',worldState);
				// }
			//});
		},	1000 / this.ups);
	},

	onInit: function(callback) {
        this.init_callback = callback;
    },

    onPlayerConnect: function(callback) {
        this.connect_callback = callback;
    }

});