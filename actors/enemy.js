(function(LP) {

  LP.enemy = function (options, my) {
    var my = my || {};
    my.name = my.name || "enemy";

    var that = LP.gameObject (options, my);
    that.player = options.player;
    that.behavior = stateful("wander", {
        wander :      LP.behaviors.wander(      that, function(){ that.behavior.transition("seekAndBump");}),          
        seekAndBump : LP.behaviors.seekAndBump( that, function(){ that.behavior.transition("wander");}),
        die :         LP.behaviors.die(         that, function(){ that.finishDying(); })
      }, logBehaviorChange);    
    
    function update(tFrame, dt){
      if (!that.alive) return;

      if (!that.behavior.state.isDying){          
        that.player.checkCollision(that.getHitbox(), tFrame);

        if (that.player.isCollidingPath(that.getHitbox())){
          that.directionX *= -1;
          that.directionY *= -1;
          that.x = that.previousX;
          that.y = that.previousY;
        }
      }

      that.savePreviousPosition();
      that.behavior.state.update(tFrame, dt);
    }

    function logBehaviorChange(event, behaviorName){
      if (event !== "state:enter") return;
      //that.log(event + " " + behaviorName);
    }

    function die(){
      that.behavior.transition("die");
    }

    function finishDying(){
      that.alive = false;
      that.log("died");
    }

    // Init code

    var initialPoint = LP.math.getRandomChoice(that.player.getFilledMapPoints());
    that.x = initialPoint.x;
    that.y = initialPoint.y;
    that.previousX = that.x;
    that.previousY = that.y;

    that.update = update;
    that.logBehaviorChange = logBehaviorChange;
    that.die = die;
    that.finishDying = finishDying;

    return that;
  };
}(this.LP = this.LP || {}));
