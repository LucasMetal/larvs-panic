(function(LP) {

  LP.circleEnemy = function (options, my) {
    options = LP.helpers.clone(options);
    options.radius = options.radius || 40; 
    var my = my || {};
    my.name = my.name || "circleEnemy";
    my.color = my.color || "grey";

    var that = LP.enemy(options, my),
        superRender = that.superior("render");
    that.behavior = stateful("wander", {
        wander : LP.behaviors.wander.create(that, that.player, that.canvasW, that.canvasH, that.speed, that.radius, function(){ that.behavior.transition("multiFire");}),
        multiFire : LP.behaviors.multiFire.create(that, that.player, that.canvasW, that.canvasH, that.speed, that.radius, function(){ that.behavior.transition("seekAndBump");}),
        seekAndBump : LP.behaviors.seekAndBump.create(that, that.player, that.canvasW, that.canvasH, that.speed, that.radius, function(){ that.behavior.transition("wander");}),
        die : LP.behaviors.die.create(that, that.player, that.canvasW, that.canvasH, that.speed, that.radius, function(){ that.die(); })
      }, that.logBehaviorChange);

    function render(canvasContext){
      if (that.behavior.state.bullets){
        for (var i = that.behavior.state.bullets.length - 1; i >= 0; i--) {
          that.behavior.state.bullets[i].render(canvasContext);
        }
      }

      my.fillStyle = my.color;
      if (that.behavior.state.isDying){
        var colorUnit = Math.floor(LP.math.lerp(255,0, that.behavior.state.colorPercentage));
        my.fillStyle = 'rgb(' + colorUnit + ',' + colorUnit + ',' + colorUnit + ')';
      } else if (that.behavior.state.isFiring){
        my.fillStyle = 'rgb(' + Math.floor(LP.math.lerp(0,255, that.behavior.state.colorPercentage)) + ',0,0)';
      }
      
      superRender(canvasContext);
    }

    that.render = render;
  
    return that;
  };
}(this.LP = this.LP || {}));
