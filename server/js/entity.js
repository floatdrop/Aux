var cls = require("./lib/class");

var actions = {};

module.exports = Entity = cls.Class.extend({
    init: function(id, type, kind) {
        this.id = id;
        this.type = type;
        this.kind = kind;
        this.position = {x: 0, y: 0};
        this.angle = 0;
        this.animation = null;
    },
    setPosition: function(x, y) {
        this.position.x = x;
        this.position.y = y;
    },
    getPosition: function() {
        return { x: this.position.x, y: this.position.y };
    },
    setAngle: function(a) {
        this.angle = a;
    },
    getAngle: function() {
        return this.angle;
    },
    construct: function(b2w) {

    },
    destruct: function() {

    },
    scheduleAction: function(action, timeout, id) {
    	if (timeout <= 0)
    		process.nextTick(action);
    	else {
            if (id in actions)
                clearTimeout(actions[id]);
    		var timeoutId = setTimeout(action, timeout);
            if (id)
                actions[id] = timeoutId;
        }
    },
    getBaseState: function() {
        return {
            id: this.id,
            kind: this.kind,
            position: this.getPosition(),
            angle: this.getAngle(),
            animation: this.animation
        };
    },
});