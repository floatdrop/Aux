/*** A player ship ***/
function Bullet(world, player) {
    this.world = world

    var bodyDef = new b2BodyDef()
    bodyDef.position.Set(
        player.body.GetPosition().x - Math.sin(player.body.GetAngle()) * -16, 
        player.body.GetPosition().y + Math.cos(player.body.GetAngle()) * -16)
    this.body = this.world.box2d.CreateBody(bodyDef)
    
    var boxDef = new b2PolygonDef()
    boxDef.SetAsBox(2, 2)
    boxDef.restitution = 0.2
    boxDef.density = 2.0
    boxDef.friction = 0.5
    
    this.body.CreateShape(boxDef)
    this.body.SetMassFromShapes()

    this.alpha = 0.8
    this.strokeStyle = 'rgba(0, 0, 0, ' + this.alpha + ')'
    this.fillStyle = 'rgba(0, 0, 0, ' + this.alpha + ')'

    this.body.SetLinearVelocity( {
        x: Math.sin(player.body.GetAngle()) * 2500, 
        y: Math.cos(player.body.GetAngle()) * -2500
    } )

    this.stopped = false

    this.update = function(gs) {

        var lv = this.body.GetLinearVelocity();
        if (this.stopped || (Math.abs(lv.x) < 5 && Math.abs(lv.y) < 5))
        {
            lv.x = 0
            lv.y = 0
            this.stopped = true
            this.alpha -= 0.025
            this.strokeStyle = 'rgba(0, 0, 0, ' + this.alpha + ')'
            this.fillStyle = 'rgba(0, 0, 0, ' + this.alpha + ')'
            if (this.alpha <= 0) 
            {
                this.update = function (gs) { }
                this.draw = function (c) { }
                gs.delEntity(this)
            }
        }
        lv.Multiply(0.98)
        this.body.SetLinearVelocity(lv);
        this.body.SetAngularVelocity(0);
    }
    
    this.draw = function(c) {
        this.world.DrawPoly(c, this);
    }
}
