(function(LP) {

  LP.circleEnemy = function (x,y, canvasW, canvasH, player) {
    var myEnemy = {},
        speed = 1,
        X = x,
        Y = y,
        canvasW = canvasW,
        canvasH = canvasH,
        isFiring = false,
        radius = 10,
        previousX = x,
        previousY = y,
        directionX = 1,
        directionY = 0,
        bullets = [],
        player = player,
        lastFireTime = 0,
        haveJustFired = false;

    myEnemy.update = function(tFrame){

      player.checkCollision(myEnemy.getHitbox(), tFrame);

      if (tFrame - lastFireTime > 1000){
        haveJustFired = false;
      }
      
      previousX = X;
      previousY = Y;

      X += speed * directionX;

      if (X <= 0 || X >= canvasW){
        directionX *= -1;
      }

      // Fires a bullet when player is on same line or column
      if (X === player.X) fireBullet ( 0, player.Y < Y ? -1 : 1 , tFrame);
      if (Y === player.Y) fireBullet ( player.X < X ? -1 : 1, 0 , tFrame);

      // Remove dead bullets and update live ones
      for (var i = bullets.length - 1; i >= 0; i--) {
        if (!bullets[i].alive){
          bullets.splice(i,1);
          continue;
        } 

        bullets[i].update(tFrame);
      }

/*
      if (input.right && ( X + width) < canvasW){
        X = Math.min(canvasW - width, X + speed); 
      }

      if (input.up && Y > 0){
        Y = Math.max(0, Y - speed); 
      }

      if (input.down && (Y + height) < canvasH){
        Y = Math.min(canvasH - height, Y + speed); 
      }
*/
/*
      isFiring = input.fire;

      var previousPoint = map[previousX + canvasW * previousY]; 
      var currentPoint = map[X + canvasW * Y];
   
      // If it's firing we update the path, otherwise he can't move outside
      if (isFiring){

        // Nothing more to calculate
        if (previousX === X && previousY === Y) return;

        if (currentPoint === 'T' || currentPoint === 'E'){
            // We have bit our own tail or the pixel was empty
            console.log("tail bit or empty pixel");
            X = previousX;
            Y = previousY;      
        } else if (currentPoint === 'P'){

          lastPathY = Y;
          lastPathX = X;
        
          if (previousPoint !== 'P'){            
            console.log("path closed!", previousPoint);
            // Transform all temporal paths into final paths
            replaceValuesInMap('T','P');

            // We fill two zones, starting from the previous position 
            // TODO: Fix previous position selection
            var zone1 =  floodFill(map, canvasW, previousX,     previousY - 1, 'F', '1');
                zone1 += floodFill(map, canvasW, previousX - 1, previousY    , 'F', '1');
                zone1 += floodFill(map, canvasW, previousX - 1, previousY - 1, 'F', '1');
            var zone2 =  floodFill(map, canvasW, previousX,     previousY + 1, 'F', '2');
                zone2 += floodFill(map, canvasW, previousX + 1, previousY    , 'F', '2');
                zone2 += floodFill(map, canvasW, previousX + 1, previousY + 1, 'F', '2');

            // We choose the smallest zone, the other one gets reset to F
            replaceValuesInMap(zone1 < zone2 ? '1' : '2','E');
            replaceValuesInMap(zone1 < zone2 ? '2' : '1','F');
          }

        }
        else
        { // We are just drawing
          map[X + canvasW * Y] = 'T';
        }
      } else if (currentPoint === 'P'){
        // We are just walking on a path
        lastPathY = Y;
        lastPathX = X;
      } else if (previousPoint === 'T'){
        // We were drawing, but we stop without closing a path, just reset the path and go back to last path known
        // Transform all temporal paths into filled
        replaceValuesInMap('T','F');
        X = lastPathX;
        Y = lastPathY;
      } else {
        // We are not drawing, and we are trying to walk outside a path, we can't do that
        X = previousX;
        Y = previousY;      
      }
      */
    };

    myEnemy.render = function(canvasContext){

      for (var i = bullets.length - 1; i >= 0; i--) {
        bullets[i].render(canvasContext);
      }

      canvasContext.beginPath();
      canvasContext.moveTo(X,Y);
      canvasContext.ellipse(X, Y, radius, radius, 0, 0, 2 * Math.PI);      
      canvasContext.fillStyle = "grey";
      canvasContext.fill();
    };

    myEnemy.getHitbox = function(){
      return {x: X - radius, y: Y - radius, width: radius*2, height: radius*2};
    };
    
    // Private functions

    function fireBullet(xDirection, yDirection, tFrame){
      if (haveJustFired) return;

      console.log('firing bullet', xDirection, yDirection);
      bullets.push(LP.bullet(X, Y, xDirection, yDirection, canvasW, canvasH, player))
      haveJustFired = true;
      lastFireTime = tFrame;
    }
/*
    function replaceValuesInMap(oldVal, newVal){
      for (var i = map.length - 1; i >= 0; i--) {
        if (map[i] === oldVal) map[i] = newVal;
      }
    }
        
    function getMapCoordinate(x,y){
      return map[y * canvasW + x];
    }

    function renderToCanvas(width, height, render, canvas) {
      canvas = canvas || createCanvas(width, height, canvas);
      render(canvas.getContext('2d'));
      return canvas;
    }

    function createCanvas(width, height) {
      var canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // TODO: Comment this, it's just for debugging
      canvas.globalAlpha = 1;
      document.body.appendChild(canvas);  
      var ctx = canvas.getContext('2d')
      ctx.fillStyle = "blue";
      ctx.fillRect(0, 0, canvasW, canvasH);
      
      return canvas;
    }
   */
    // Init code

/*
    var playerCanvas = createCanvas(canvasW, canvasH);
    var ctxPlayer = playerCanvas.getContext('2d'),
        map = new Array(canvasW*canvasH);
    
    for (var i = map.length - 1; i >= 0; i--) {
      map[i] = 'F';
    }

    generateRandomClearedZone();
  */  
    return myEnemy;
  };
}(this.LP = this.LP || {}));
