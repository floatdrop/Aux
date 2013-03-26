/*** World ***/
function World(gs, box2d) {
    this.gs = gs
    this.box2d = box2d
    this.player = null;
    this.x = 0;
    this.y = 0;
    this.w = gs.width / 2
    this.h = gs.height / 2
    this.relx = 0;
    this.rely = 0;
    
    this.setPlayer = function(player) {
        this.player = player;
    }
    
    var sprite = new Sprite(["center", "bottom"], {
        "ground": [["images/ground.png", 0],]
    },
    // callback gets called when everything is loaded
    function() {
        sprite.action("ground");
    });
    this.sprite = sprite;

    this.draw = function(c) {
        this.gs.clear();

        for (var x = 0; x < 26; x++ )
            for (var y = 0; y < 20; y++ )
                this.sprite.draw(c, [x * 32, y * 32])

    }
    
    this.update = function(gs) {
        this.box2d.Step(1.0/gs.framerate, 1);
    }
    
    this.pointerUp = function() {
        this.player.Shooting = false
    }

    this.pointerDown = function() {
        this.player.Shooting = true
    }
        
    this.pointerBox = function() {
        return [0, 0, gs.width, gs.height];
    }

    this.DrawPoly = function(c, entity) {
        if (entity.body) {
            var position = entity.body.GetPosition()
            var angle = entity.body.GetAngle()

            c.strokeStyle = entity.strokeStyle
            c.fillStyle = entity.fillStyle
            var t = entity.body.GetXForm()
            c.translate(t.position.x, t.position.y)
            c.rotate(entity.body.GetAngle())
            c.beginPath()
            var poly = entity.body.GetShapeList().GetVertices()
            c.moveTo(poly[0].x, poly[0].y)
            for (var n = 0 ; n < entity.body.GetShapeList().GetVertexCount() ; n++) {
                c.lineTo(poly[n].x, poly[n].y)
            }
            c.lineTo(poly[0].x, poly[0].y)
            c.closePath()
            c.fill()
            c.stroke()
            c.rotate(-entity.body.GetAngle())
            c.translate(-t.position.x, -t.position.y)
        }
    }

}