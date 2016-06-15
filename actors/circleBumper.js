(function(LP) {

  LP.circleBumper = function (x,y, canvasW, canvasH, player) {
    var myEnemy = {
          X : x,
          Y : y,      
          directionX : 1,
          directionY : 0
        },
        speed = 1,
        canvasW = canvasW,
        canvasH = canvasH,
        radius = 10,
        previousX = x,
        previousY = y,        
        player = player,
        behavior = stateful("wander", {
          wander : LP.behaviors.wander.create(myEnemy, player, canvasW, canvasH, speed, radius, function(){ behavior.transition("seekAndBump");}),
          seekAndBump : LP.behaviors.seekAndBump.create(myEnemy, player, canvasW, canvasH, speed, radius, function(){ behavior.transition("wander");})
        }, function(event, behaviorName){console.log("circleBumper: " + event + " " + behaviorName);});

    myEnemy.update = function(tFrame, dt){
      player.checkCollision(myEnemy.getHitbox(), tFrame);

      if (player.isCollidingPath(myEnemy.getHitbox())){
        myEnemy.directionX *= -1;
        myEnemy.directionY *= -1;
        myEnemy.X = previousX;
        myEnemy.Y = previousY;
      }

      previousX = myEnemy.X;
      previousY = myEnemy.Y;

      behavior.state.update(tFrame, dt);
    };

    myEnemy.render = function(canvasContext){
      canvasContext.beginPath();
      canvasContext.moveTo(myEnemy.X,myEnemy.Y);
      canvasContext.ellipse(myEnemy.X, myEnemy.Y, radius, radius, 0, 0, 2 * Math.PI);      
      canvasContext.fillStyle = "blue";
      canvasContext.fill();
    };

    myEnemy.getHitbox = function(){
      return {x: myEnemy.X - radius, y: myEnemy.Y - radius, width: radius*2, height: radius*2};
    };
    
    // Private functions   

    // Init code
  
    return myEnemy;
  };
}(this.LP = this.LP || {}));
