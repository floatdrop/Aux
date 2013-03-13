ScaleFactor = 64

function UniObject(obj) {

    this.data = obj
    this.sprite = new Sprite(this.data.sprite_align, this.data.sprites)
    this.sprite.action(this.data.current_sprite)
    this.createBox2d = function(box2d) 
    {
        // Here you need to create body like this:
        
        // this.body = box2d.createBody(...)

        // and fill body with polygons... etc...
    }

    this.createGs = function(gs) 
    {
        gs.addEntity(this)
    }

    this.draw = function(canvas, gamesoup)
    {
        this.sprite.draw(canvas, [this.data.position.x * ScaleFactor, this.data.position.y * ScaleFactor])
    }

    this.update = function(gamesoup)
    {

    }

}