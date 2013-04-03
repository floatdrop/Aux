var cls = require("./lib/class"),
    Box2D = require('./box2d');

var actions = {};
var b2BodyDef = Box2D.Dynamics.b2BodyDef,
    b2Body = Box2D.Dynamics.b2Body,
    b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
    b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;

module.exports = Entity = cls.Class.extend({
    init: function(id, world, type, kind) {
        this.id = id;
        this.world = world;
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
        return { x: this.position.x, y: this.position.y};
    },
    setAngle: function(a) {
        this.angle = a;
    },
    getAngle: function() {
        return this.angle;
    },
    construct: function() {

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

    createBox: function(b2w, x, y, width, height) {
        var body = this.createBody(b2w, x, y);
        return this.createBoxFixture(body, width, height);
    },
    createPolygon: function(b2w,x, y, points){
        var body = this.createBody(b2w, x,y);
        return this.createpolygonFixture(body, points);
    },

    createBoxFixture: function(body, width, height){
        var fixDef = new b2FixtureDef;
        fixDef.density = 1.5;
        fixDef.friction = 1;
        fixDef.restitution = 1;
        fixDef.shape = new b2PolygonShape;
        fixDef.shape.SetAsBox(width, height);
        return body.CreateFixture(fixDef);
    },
    createPolygonFixture: function(body, points){
        var fixDef = new b2FixtureDef;
        fixDef.density = 1.5;
        fixDef.friction = 1;
        fixDef.restitution = 1;

        fixDef.shape = new b2PolygonShape;
        fixDef.shape.vertexCount = points.length;
        console.log(points.length);
        for (var i = 0; i < points.length; i++) {
            fixDef.shape.vertices[i].Set(points[i]);
        }
        return body.CreateFixture(fixDef);
    },

    createBody: function(b2w, x, y){
        var bodyDef = new b2BodyDef;
        bodyDef.type = b2Body.b2_staticBody;
        bodyDef.position.x = x;
        bodyDef.position.y = y;	
        return b2w.CreateBody(bodyDef);
    }
});