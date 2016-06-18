(function(LP) {

  LP.bullet = function (options) {
    options.radius = options.radius || 2;

    var my = my || {};
    my.name = my.name || "bullet";
    my.fillStyle = options.fillStyle || "yellow";

    var that = LP.gameObject (options, my);
    that.player = options.player;

    function update(tFrame){      
      if (!that.alive) return;

      if (that.player.checkCollision(that.getHitbox(), tFrame)){
        that.die();
        return;
      }

      that.savePreviousPosition();

      that.x += that.speed * that.directionX;
      that.y += that.speed * that.directionY;
      
      if (that.x <= 0 || that.x >= that.canvasW || that.y <= 0 || that.y >= that.canvasH){
        that.die();
      }
    }
 
    that.update = update;

    return that;
  };
}(this.LP = this.LP || {}));
