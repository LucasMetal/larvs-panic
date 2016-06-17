(function(LP) {

  LP.gameObject = function (options, my) {
    var my = my || {};
    my.name = my.name || "gameObject";
    my.fillStyle = my.fillStyle || "black";

    var that = {
        x : options.x,
        y : options.y,
        directionX : 1,
        directionY : 0,
        alive : true,
        radius : options.radius || 10,
        previousX : 0,
        previousY : 0,
        canvasW : options.canvasW,
        canvasH : options.canvasH,
        speed : options.speed || 1
      },
      hitbox = {x: that.x - that.radius, y: that.y - that.radius, width: that.radius*2, height: that.radius*2};
        
    function update(tFrame, dt){
      if (!that.alive) return;
      savePreviousPosition();
    }

    function savePreviousPosition(){
      that.previousX = that.x;
      that.previousY = that.y;      
    }

    function render(canvasContext){
      if (!that.alive) return;
      canvasContext.beginPath();
      canvasContext.moveTo(that.x, that.y);
      canvasContext.ellipse(that.x, that.y, that.radius, that.radius, 0, 0, 2 * Math.PI);
      canvasContext.fillStyle = my.fillStyle;
      canvasContext.fill();
    }

    function getHitbox(){
      hitbox.x = that.x - that.radius;
      hitbox.y = that.y - that.radius;
      return hitbox;
    }

    function log(){      
      Array.prototype.unshift.call(arguments, my.name + ": ");
      console.log.apply(console, arguments);
    }

    function die(){
      that.alive = false;     
      log("died");
    }
    
    that.update = update;
    that.savePreviousPosition = savePreviousPosition;
    that.render = render;
    that.getHitbox = getHitbox;
    that.log = log;
    that.die = die;

    return that;      
  };
}(this.LP = this.LP || {}));
