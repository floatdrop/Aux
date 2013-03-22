var cls = require("./lib/class");

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
        return { x: this.angle };
    },
    construct: function(b2w) {

    },
    destruct: function() {

    },
    // Contains BUG
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
            position: this.getPosition(),
            angle: this.getAngle(),
            animation: this.animation
        };
    },
});