/*** A player ship ***/
function Rock(world, data) {
    this.world = world;

    this.bodyDef = new b2BodyDef();
    this.bodyDef.position.Set(data.x, data.y);
    this.body = this.world.box2d.CreateBody(this.bodyDef);
    
    var boxDef = new b2PolygonDef();
    boxDef.SetAsBox(21, 10)
    boxDef.restitution = 0.2;
    boxDef.density = 1.0;
    boxDef.friction = 1.0;
    
    this.body.CreateShape(boxDef);
    this.body.SynchronizeShapes();

    this.strokeStyle = 'rgba(255, 255, 255, 1.0)';
    this.fillStyle = 'rgba(115, 115, 115, 1.0)';
    
    var sprite = new Sprite(["center", "bottom"], {
        "rock": [["images/rock.png", 0],],
    },
    // callback gets called when everything is loaded
    function() {
        sprite.action("rock");
    });

    this.sprite = sprite

    this.update = function(gs) {

        this.priority = this.body.GetPosition().y
        gs.sortEntities()

        var lv = this.body.GetLinearVelocity();
        lv.Multiply(0.5)
        this.body.SetLinearVelocity(lv);
    }
    
    this.draw = function(c) {


        this.sprite.draw(c, [this.body.GetPosition().x, this.body.GetPosition().y + 12])

        //this.world.DrawPoly(c, this)
        
    }
}