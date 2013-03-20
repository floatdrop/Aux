define(function() {

    var Entity = Class.extend({
    	init: function(id, kind) {
            this.id = id;
            this.kind = kind;
            this.x = 0;
            this.y = 0;
    	},

    	setPosition: function(x, y) {
    		this.x = x;
    		this.y = y;
    	}
    });
    
    return Entity;
});