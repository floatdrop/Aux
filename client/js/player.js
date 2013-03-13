function Player() 
{
    this.draw = function(canvas, gamesoup) 
    {
        this.world.DrawPoly(c, this)
        this.sprite.draw(c, [this.body.GetPosition().x, this.body.GetPosition().y + 12])
    }
}
