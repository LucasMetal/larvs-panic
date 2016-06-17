(function(LP) {

  LP.circleBumper = function (options, my) {
    options = LP.helpers.clone(options);
    options.radius = options.radius || 20; 
    var my = my || {};
    my.name = my.name || "circleBumper";
    my.color = my.color || "blue";

    var that = LP.enemy(options, my),
        superRender = that.superior("render");
    that.behavior = stateful("wander", {
        wander : LP.behaviors.wander.create(that, that.player, that.canvasW, that.canvasH, that.speed, that.radius, function(){ that.behavior.transition("seekAndBump");}),
        seekAndBump : LP.behaviors.seekAndBump.create(that, that.player, that.canvasW, that.canvasH, that.speed, that.radius, function(){ that.behavior.transition("wander");}),
        die : LP.behaviors.die.create(that, that.player, that.canvasW, that.canvasH, that.speed, that.radius, function(){ that.die(); })
      }, that.logBehaviorChange);

    function render(canvasContext){
      my.fillStyle = my.color;
      if (that.behavior.state.isDying){
        var colorUnit = Math.floor(LP.math.lerp(255,0, that.behavior.state.colorPercentage));
        my.fillStyle = 'rgb(' + colorUnit + ',' + colorUnit + ',' + colorUnit + ')';
      }

      superRender(canvasContext);
    }

    that.render = render;
  
    return that;
  };
}(this.LP = this.LP || {}));
