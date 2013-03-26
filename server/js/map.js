var fs = require('fs'),
  Constants = require('../../client/js/constants'),
  SimpleObject = require('./simpleObject');

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
          self.fillWorld(self.data, self.engine);
        });
    },

    sendMap: function(socket){
        if (this.isLoaded){
          socket.emit("map", this.data);
          return;
        }

        setInterval(function () {
          if (this.isLoaded){
            socket.emit("map", this.data);
            return;
          }
        },  100);
    },

    fillWorld: function(data, engine){
        var i=0;
        while (data.layers[i].name !== "objects")
          i++;

        var objects = data.layers[i].objects;
        var id = engine.entitiesCount();

        for (var i = 0;i<objects.length;i++){
			var o = new SimpleObject(id, objects[i], engine);
			id++;
        }
    }
});