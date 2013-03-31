define(['sprites'], function(Sprites) {

    var Entity = Class.extend({
        init: function(id, kind) {
            this.id = id;
            this.kind = kind;
            this.x = 0;
            this.y = 0;
            this.sprite = null;
            this.flipSpriteX = false;
            this.flipSpriteY = false;
            this.animations = null;
            this.currentAnimation = null;
        },
        setPosition: function(x, y) {
            this.x = x;
            this.y = y;
        },
        setAngle: function(a) {
            this.angle = a;
        },
        update: function(entity_info){
        },
        setSprite: function(sprite) {
            if(!sprite) {
                console.log(this.id + " : sprite is null", true);
                throw "Error";
            }
            if(this.sprite && this.sprite.name === sprite.name) {
                return;
            }
            this.sprite = sprite;
            this.animations = sprite.createAnimations();
            this.isLoaded = true;
        },
        getAnimationByName: function(name) {
            var animation = null;
        
            if(name in this.animations) {
                animation = this.animations[name];
            }
            else {
                console.log("No animation called " + name);
            }
            return animation;
        },
        idle: function() {
            
        },
        setAnimation: function(name, count, onEndCount) {
            var self = this;

            if(this.isLoaded) {
                if(this.currentAnimation && this.currentAnimation.name === name) {
                    return;
                }

                var s = this.sprite,
                    a = this.getAnimationByName(name);

                if(a) {
                    this.currentAnimation = a;
                    if(name.substr(0, 3) === "atk") {
                        this.currentAnimation.reset();
                    }
                    this.currentAnimation.setCount(count ? count : 0, onEndCount || function() {
                        self.idle();
                    });
                }
            }
            else {
                console.log("Not ready for animation");
            }
        }
    });
    
    return Entity;
});