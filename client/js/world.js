function World(gs) {
    this.player = null
    this.gs = gs

    this.draw = function(canvas, gamesoup) 
    {
        gamesoup.clear();
    }
    
    this.update = function(gamesoup)
    {
        gamesoup.box2d.Step(1.0/gamesoup.framerate, 1);
    }
    
    this.create = function(obj)
    {
        uniobject = new UniObject(obj)
        uniobject.createBox2d(this.gs.box2d)
        uniobject.createGs(this.gs)
    }

    /** Shooting functions **/

    this.pointerDown = function() 
    {
    }

    this.pointerUp = function()
    {
    }

    this.pointerBox = function() 
    {
        return [0, 0, gs.width, gs.height];
    }

    /** Helper function, that draws poly of entity **/
    this.DrawPoly = function(c, entity) 
    {
        if (!entity.body) 
            return;

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
            for (var n = 0 ; n < entity.body.GetShapeList().GetVertexCount() ; n++)
                c.lineTo(poly[n].x, poly[n].y)
            c.lineTo(poly[0].x, poly[0].y)
        c.closePath()

        c.fill()
        c.stroke()
        
        c.rotate(-entity.body.GetAngle())
        c.translate(-t.position.x, -t.position.y)

    }

}