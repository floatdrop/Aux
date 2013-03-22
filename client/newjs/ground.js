/*** World ***/
function Ground() {
   
    var sprite = new Sprite(["center", "bottom"], {
        "ground": [["images/ground.png", 0],]
    },
	
    // callback gets called when everything is loaded
    function() {
        sprite.action("ground");
    });
    this.sprite = sprite;

    this.draw = function(c) {
        for (var x = 0; x < 26; x++ )
            for (var y = 0; y < 20; y++ )
                this.sprite.draw(c, [x * 32, y * 32])
    }
}