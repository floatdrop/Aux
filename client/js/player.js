/*** A player ship ***/
function Player(world) {
    this.world = world;

    this.bodyDef = new b2BodyDef();
    this.bodyDef.position.Set(this.world.gs.width / 2, this.world.gs.height / 2);
    this.body = this.world.box2d.CreateBody(this.bodyDef);
    
    var boxDef = new b2PolygonDef();
    boxDef.SetAsBox(10, 10)
    boxDef.restitution = 0.2;
    boxDef.density = 2.0;
    boxDef.friction = 0.5;
    
    this.body.CreateShape(boxDef);
    this.body.SetMassFromShapes();
    this.body.SetBullet(true)
    this.world.setPlayer(this);

    this.strokeStyle = 'rgba(255, 255, 255, 1.0)';
    this.fillStyle = 'rgba(115, 115, 115, 1.0)';
    
    this.heading = null
    this.Shooting = false
    WALK_FRAMES = 8

    var sprite = new Sprite(["center", "bottom"], {
        
        "stand up": [["images/player/player_up-2.png", 0],],
        "walk up": [
            ["images/player/player_up-1.png", WALK_FRAMES],
            ["images/player/player_up-2.png", WALK_FRAMES],
            ["images/player/player_up-3.png", WALK_FRAMES],
            ["images/player/player_up-2.png", WALK_FRAMES]
        ],
        
        "stand right": [["images/player/player_right-2.png", 0],],
        "walk right": [
            ["images/player/player_right-1.png", WALK_FRAMES],
            ["images/player/player_right-2.png", WALK_FRAMES],
            ["images/player/player_right-3.png", WALK_FRAMES],
            ["images/player/player_right-2.png", WALK_FRAMES]
        ],
        
        "stand left": [["images/player/player_left-2.png", 0],],
        "walk left": [
            ["images/player/player_left-1.png", WALK_FRAMES],
            ["images/player/player_left-2.png", WALK_FRAMES],
            ["images/player/player_left-3.png", WALK_FRAMES],
            ["images/player/player_left-2.png", WALK_FRAMES]
        ],
        
        "stand down": [["images/player/player_down-2.png", 0],],
        "walk down": [
            ["images/player/player_down-1.png", WALK_FRAMES],
            ["images/player/player_down-2.png", WALK_FRAMES],
            ["images/player/player_down-3.png", WALK_FRAMES],
            ["images/player/player_down-2.png", WALK_FRAMES]
        ],
    },
    // callback gets called when everything is loaded
    function() {
        sprite.action("stand up");
    });

    this.sprite = sprite

    // A key        
    this.keyDown_65 = this.keyHeld_65 = function () {
        var lv = this.body.GetLinearVelocity()
        if (lv.x > -500)
            lv.x -= 50;
        this.body.SetLinearVelocity(lv)
    }
    
    // D key
    this.keyDown_68 = this.keyHeld_68 = function () {
        var lv = this.body.GetLinearVelocity()
        if (lv.x < 500)
            lv.x += 50;
        this.body.SetLinearVelocity(lv)
    }

    // W key
    this.keyDown_87 = this.keyHeld_87 = function () {
        var lv = this.body.GetLinearVelocity()
        if (lv.y > -500)
            lv.y -= 50;
        this.body.SetLinearVelocity(lv)
    }
    
    // S key
    this.keyDown_83 = this.keyHeld_83 = function () {
        var lv = this.body.GetLinearVelocity()
        if (lv.y < 500)
            lv.y += 50;
        this.body.SetLinearVelocity(lv)
    }

    this.keyDown = function (keyCode) {
        console.log(keyCode);
    }
    
    this.incAngle = function(sign) {
        this.angle = (this.angle + sign * this.turnRate) % (2 * Math.PI);
    }

    this.GetAction = function(lv, direction)
    {
        if (Math.abs(lv.x) > 50 || Math.abs(lv.y) > 50)
            return "walk " + direction
        return "stand " + direction
    }

    this.update = function(gs) {
        this.body.WakeUp()
        
        if (this.Shooting == true) {
            gs.addEntity(new Bullet(w, this));
            this.Shooting = false
        }
        this.priority = this.body.GetPosition().y
        gs.sortEntities()
        
        var lv = this.body.GetLinearVelocity();
        lv.Multiply(0.75)
        this.body.SetLinearVelocity(lv);

        var heading = [
            gs.pointerPosition[0] - gs.width / 2 - (this.body.GetXForm().position.x - gs.width / 2),
            gs.pointerPosition[1] - gs.height / 2 - (this.body.GetXForm().position.y - gs.height / 2),
        ];
        
        // rotate our heading
        var pts = [heading[0] * Math.cos(this.body.GetAngle()) + heading[1] * Math.sin(this.body.GetAngle()), heading[0] * Math.sin(this.body.GetAngle()) - heading[1] * Math.cos(this.body.GetAngle())];
        this.heading = Math.atan2(pts[0], pts[1]);
        
        var angle = (this.body.GetAngle() * 180) / Math.PI
        while (angle < 0) angle += 360

        if (angle > -45 && angle <= 45)
            this.sprite.action(this.GetAction(lv, "up"))
        if (angle > 45 && angle <= 135)
            this.sprite.action(this.GetAction(lv, "right"))
        if (angle > 135 && angle <= 225)
            this.sprite.action(this.GetAction(lv, "down"))
        if (angle > 225 && angle <= 315)
            this.sprite.action(this.GetAction(lv, "left"))
        if (angle > 315)
            this.sprite.action(this.GetAction(lv, "up"))

        this.sprite.update();

        // if the user is doing touch/mouse events then head towards the selected heading
        if (this.heading && this.body !== undefined) {
            if (this.heading > 0.1) {
                this.body.SetAngularVelocity(5);
            } else if (this.heading < -0.1) {
                this.body.SetAngularVelocity(-5);
            } else {
                this.body.SetAngularVelocity(0);
            }
        }

    }
    
    this.draw = function(c) {

        //this.world.DrawPoly(c, this)

        this.sprite.draw(c, [this.body.GetPosition().x, this.body.GetPosition().y + 12])
        
    }
}
