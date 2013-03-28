var fs = require('fs'),
  Constants = require('../../client/js/constants'),
  CommonEntity = require('./commonEntity');

module.exports = Map = Entity.extend({
    init: function(config,engine) {
        this.isLoaded = false;
        this.data = {};
        this.engine = engine;
        var self = this;

        fs.readFile(config.map_filepath, 'utf8', function (err,data) {
          if (err) {
            return console.log(err);
          }
          self.data = JSON.parse(data);
          self.isLoaded = true;
		  console.log("map loaded");
          self.fillWorld(self.data, self.engine);
        });
    },

    sendMap: function(socket){
		var self = this;
        var intervalId = setInterval(function () {
          if (self.isLoaded){
            socket.emit("map", self.data);
			console.log("map sended");
            clearInterval(intervalId);
          }
        },  100);
    },

    fillWorld: function(data, engine){
        var i=0;
        while (data.layers[i].name !== "objects")
          i++;

        var objects = data.layers[i].objects;
        var id = 0;

        for (var i = 0;i<objects.length;i++){
			var o = new CommonEntity(id, objects[i], engine);
			id++;
        }
    }
});