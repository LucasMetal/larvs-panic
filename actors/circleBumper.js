(function(LP) {

  LP.circleBumper = function (x,y, canvasW, canvasH, player) {
    var myEnemy = {},
        speed = 1,
        X = x,
        Y = y,
        canvasW = canvasW,
        canvasH = canvasH,
        radius = 10,
        previousX = x,
        previousY = y,
        directionX = 1,
        directionY = 0,
        player = player,
        lastDirectionChangeTime = 0,
        lastBehaviorChangeTime = 0,
        behavior = wanderBehavior;   

    myEnemy.update = function(tFrame, dt){
      player.checkCollision(myEnemy.getHitbox(), tFrame);
      
      previousX = X;
      previousY = Y;

      behavior(tFrame, dt);     
    };

    myEnemy.render = function(canvasContext){
      canvasContext.beginPath();
      canvasContext.moveTo(X,Y);
      canvasContext.ellipse(X, Y, radius, radius, 0, 0, 2 * Math.PI);      
      canvasContext.fillStyle = "blue";
      canvasContext.fill();
    };

    myEnemy.getHitbox = function(){
      return {x: X - radius, y: Y - radius, width: radius*2, height: radius*2};
    };
    
    // Private functions

    function changeBehaviour(behaviorToSet, tFrame){
        behavior = behaviorToSet;
        lastBehaviorChangeTime = tFrame;
        console.log("changed behavior to " + behaviorToSet.name);
    }

    function wanderBehavior(tFrame, dt){
      if (X - radius <= 0 || X + radius >= canvasW) directionX *= -1; 
      if (Y - radius <= 0 || Y + radius >= canvasH) directionY *= -1; 

      if (tFrame - lastDirectionChangeTime > LP.math.getRandomInt(5,10) * 1000){
        directionY = Math.random ();
        directionX = Math.random ();
        //if (Math.random() > 0.5) directionX *= -1;
        //if (Math.random() > 0.5) directionY *= -1;
        lastDirectionChangeTime = tFrame;
      }

      X += speed * directionX;
      Y += speed * directionY;

      if (tFrame - lastBehaviorChangeTime > LP.math.getRandomInt(15,20) * 1000) changeBehaviour(seekAndBumpBehavior, tFrame);
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
