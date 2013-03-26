function Asteroid(world, data, asteroidScale) {
        this.world = world;
        this.strokeStyle = 'rgba(255, 255, 255, 1.0)';
        this.fillStyle = 'rgba(115, 115, 115, 1.0)';

        this.bodyDef = new b2BodyDef();
        this.bodyDef.position.Set(data.x, data.y);
        this.bodyDef.angle = data.angle

        var polyDef = new b2PolygonDef();

        polyDef.vertexCount = data.points.length

        for (var i = 0; i < data.points.length; i++) {
            polyDef.vertices[i].Set(data.points[i][0],data.points[i][1])
        };

        polyDef.restitution = 0.0;
        polyDef.density = 1.0;
        polyDef.friction = 0.5;

        this.body = this.world.box2d.CreateBody(this.bodyDef);
        this.body.CreateShape(polyDef);
        this.body.SynchronizeShapes();

        this.update = function() {
        }
        
        this.draw = function(c) {
            // this.world.DrawPoly(c, this)
        }
        
    }