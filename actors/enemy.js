(function(LP) {

  LP.enemy = function (options, my) {
    var my = my || {};
    my.name = my.name || "enemy";

    var that = LP.gameObject (options, my);
    that.player = options.player;
    that.behavior = stateful("wander", {
        wander : LP.behaviors.wander.create(that, that.player, that.canvasW, that.canvasH, that.speed, that.radius, function(){ that.behavior.transition("seekAndBump");}),          
        seekAndBump : LP.behaviors.seekAndBump.create(that, that.player, that.canvasW, that.canvasH, that.speed, that.radius, function(){ that.behavior.transition("wander");}),
        die : LP.behaviors.die.create(that, that.player, that.canvasW, that.canvasH, that.speed, that.radius, function(){ that.die(); })
      }, logBehaviorChange);
    
    function update(tFrame, dt){
      if (!that.alive) return;

      if (!that.behavior.isDying){          
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
      that.log(event + " " + behaviorName);
    }

    // Init code

    var initialPoint = LP.math.getRandomChoice(that.player.getFilledMapPoints());
    that.x = initialPoint.x;
    that.y = initialPoint.y;
    that.previousX = that.x;
    that.previousY = that.y;

    that.update = update;
    that.logBehaviorChange = logBehaviorChange;

    return that;
  };
}(this.LP = this.LP || {}));
