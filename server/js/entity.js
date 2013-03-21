var cls = require("./lib/class");

module.exports = Entity = cls.Class.extend({
    init: function(id, type, kind) {
        this.id = id;
        this.type = type;
        this.kind = kind;
    },
    setPosition: function(x, y) {
        this.x = x;
        this.y = y;
    },
    scheduleAction: function(action, timeout) {
    	if (timeout <= 0)
    		process.nextTick(action);
    	else
    		setTimeout(action, timeout);
    },
    getBaseState: function() {
        return {
            id: this.id,
            kind: this.kind,
            position: {x: this.x, y: this.y }
        };
    },
});