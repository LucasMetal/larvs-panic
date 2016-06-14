(function(LP) {

  LP.circleEnemy = function (x,y, canvasW, canvasH, player) {
    var myEnemy = {},
        speed = 1,
        X = x,
        Y = y,
        canvasW = canvasW,
        canvasH = canvasH,
        isFiring = false,
        radius = 20,
        previousX = x,
        previousY = y,
        directionX = 1,
        directionY = 0,
        bullets = [],
        player = player,
        lastFireTime = 0,
        haveJustFired = false,
        colorAccumulator = 0,
        lastDirectionChangeTime = 0,
        lastBehaviorChangeTime = 0,
        behavior = wanderBehavior;

    myEnemy.update = function(tFrame, dt){
      
      player.checkCollision(myEnemy.getHitbox(), tFrame);

      if (player.isCollidingPath(myEnemy.getHitbox())){
        directionX *= -1;
        directionY *= -1;
      }
      
      previousX = X;
      previousY = Y;

      behavior(tFrame, dt);
    };

    myEnemy.render = function(canvasContext){

      for (var i = bullets.length - 1; i >= 0; i--) {
        bullets[i].render(canvasContext);
      }

      canvasContext.beginPath();
      canvasContext.moveTo(X,Y);
      canvasContext.ellipse(X, Y, radius, radius, 0, 0, 2 * Math.PI);
      canvasContext.fillStyle = isFiring ? 'rgb(' + Math.floor(LP.math.lerp(0,255, colorAccumulator)) + ',0,0)' : "grey";
      canvasContext.fill();
    };

    myEnemy.getHitbox = function(){
      return {x: X - radius, y: Y - radius, width: radius*2, height: radius*2};
    };
    
    // Private functions

    function fireBullet(xDirection, yDirection, tFrame){
      //console.log('firing bullet', xDirection, yDirection);
      bullets.push(LP.bullet(X, Y, xDirection, yDirection, canvasW, canvasH, player))
      haveJustFired = true;
      lastFireTime = tFrame;
    }

    function multiFireBehavior(tFrame, dt){

      // First time we enter, we reset the color
      if (!isFiring) {
        colorAccumulator = 0;
        haveJustFired = false;
      }

      isFiring = true;

      if (colorAccumulator < 1){
        colorAccumulator += (dt/2000);
        return;
      }

      if (!haveJustFired){        
        for (var angle = 0; angle <= 360; angle += 360/18){
          // We find the coordinates of the normalized vector (legth = 1)
          var bx = Math.sin(angle * Math.PI / 180);
          var by = Math.cos(angle * Math.PI / 180);
          fireBullet ( bx, by, tFrame);
        } 
      }

      // Remove dead bullets and update live ones
      for (var i = bullets.length - 1; i >= 0; i--) {
        if (!bullets[i].alive){
          bullets.splice(i,1);
          continue;
        } 

        bullets[i].update(tFrame);
      }

      if (bullets.length === 0){
        isFiring = false;
        changeBehaviour(wanderBehavior, tFrame);
      }
    }

    function changeBehaviour(behaviorToSet, tFrame){
        behavior = behaviorToSet;
        lastBehaviorChangeTime = tFrame;
        console.log("changed behavior to " + behaviorToSet.name, this);
    }

    function wanderBehavior(tFrame, dt){
      if (X - radius <= 0 || X + radius >= canvasW) directionX *= -1; 
      if (Y - radius <= 0 || Y + radius >= canvasH) directionY *= -1; 

      if (tFrame - lastDirectionChangeTime > (Math.random () * 5 + 4 ) * 1000){
        directionY = Math.random ();
        directionX = Math.random ();
        //if (Math.random() > 0.5) directionX *= -1;
        //if (Math.random() > 0.5) directionY *= -1;
        lastDirectionChangeTime = tFrame;
      }

      X += speed * directionX;
      Y += speed * directionY;

      if (tFrame - lastBehaviorChangeTime > 10 * 1000) changeBehaviour(multiFireBehavior, tFrame);
    }

    function seekAndBumpBehavior(tFrame, dt){
      var dx = player.X - X;
      var dy = player.Y - Y;
      var distance = Math.sqrt((dx*dx) + (dy*dy));
      //this.angle = Math.atan2(this.dy,this.dx) * 180 / Math.PI;

      // We normalize the vector
      directionX = (dx/distance);
      directionY = (dy/distance);

      X += speed * directionX;
      Y += speed * directionY;

      if (LP.helpers.areColliding(player.getHitbox(), myEnemy.getHitbox())) changeBehaviour(wanderBehavior, tFrame);
    }

    // Init code

    return myEnemy;
  };
}(this.LP = this.LP || {}));
