/*** A player ship ***/
function Barrel() {
    this.position = {x:0,y:0};
	
    var sprite = new Sprite(["center", "bottom"], {
        "barrel": [["images/barrel.png", 0],],
    },
	
    // callback gets called when everything is loaded
    function() {
        sprite.action("barrel");
    });

    this.sprite = sprite

    this.update = function(gs) {
		this.priority = this.position.y
        gs.sortEntities();
	}
    
	this.reciveData = function(data) {
		this.position = data.position;
	}
	
    this.draw = function(c) {
        this.sprite.draw(c, [this.position.x, this.position.y + 12])  
    }
}