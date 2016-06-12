(function(LP) {

  LP.player = function (x,y, canvasW, canvasH) {
    var myPlayer = {
          X : y,
          Y : y,          
          lifes : 3,
          points : 0
        },
        speed = 1,
        canvasW = canvasW,
        canvasH = canvasH,
        isFiring = false,
        width = 10,
        height = 10,
        previousX = x,
        previousY = y,
        lastPathX = x,
        lastPathY = y,
        haveJustDied = false,
        dieTime = null;

    myPlayer.update = function(tFrame, input){

      // If 5 seconds passed since we day, we are fully back in life now ;)
      if (haveJustDied && (tFrame - dieTime > 5 * 1000)){
        console.log("haveJustDied set to false");
        haveJustDied = false;
      }

      previousX = myPlayer.X;
      previousY = myPlayer.Y;

      if (input.left && myPlayer.X > 0){
        myPlayer.X = Math.max(0, myPlayer.X - speed); 
      }

      if (input.right && myPlayer.X < canvasW){
        myPlayer.X = Math.min(canvasW, myPlayer.X + speed); 
      }

      if (input.up && myPlayer.Y > 0){
        myPlayer.Y = Math.max(0, myPlayer.Y - speed); 
      }

      if (input.down && myPlayer.Y < canvasH){
        myPlayer.Y = Math.min(canvasH, myPlayer.Y + speed); 
      }

      isFiring = input.fire;

      var previousPoint = map[previousX + canvasW * previousY]; 
      var currentPoint = map[myPlayer.X + canvasW * myPlayer.Y];
   
      // If it's firing we update the path, otherwise he can't move outside
      if (isFiring){

        // Nothing more to calculate
        if (previousX === myPlayer.X && previousY === myPlayer.Y) return;

        if (currentPoint === 'T' || currentPoint === 'E'){
            // We have bit our own tail or the pixel was empty
            console.log("tail bit or empty pixel");
            myPlayer.X = previousX;
            myPlayer.Y = previousY;      
        } else if (currentPoint === 'P'){

          lastPathY = myPlayer.Y;
          lastPathX = myPlayer.X;
        
          if (previousPoint !== 'P'){            
            console.log("path closed!", previousPoint);
            // Transform all temporal paths into final paths
            // TODO: Fix previous position selection: That's why we are transforming it to B, so we can revert it
            var percentageCleared = replaceValuesInMap('T','B'); // last param should be P

            // We fill two zones, starting from the previous position 
            var zone1 =  floodFill(map, canvasW, previousX,     previousY - 1, 'F', '1');
                zone1 += floodFill(map, canvasW, previousX - 1, previousY    , 'F', '1');
                zone1 += floodFill(map, canvasW, previousX - 1, previousY - 1, 'F', '1');
            var zone2 =  floodFill(map, canvasW, previousX,     previousY + 1, 'F', '2');
                zone2 += floodFill(map, canvasW, previousX + 1, previousY    , 'F', '2');
                zone2 += floodFill(map, canvasW, previousX + 1, previousY + 1, 'F', '2');

            // TODO: Fix previous position selection, this is a hack so the bug don't occur, but gameplay gets affected
            if (zone1 === 0 || zone2 === 0){
              replaceValuesInMap('1','F'); // Back to T, so respawn removes it
              replaceValuesInMap('2','F'); // Back to T, so respawn removes it
              replaceValuesInMap('B','T'); // Back to T, so respawn removes it
              respawn();
              LP.engine.showMessage("Sorry, I should fix that bug!");
              return;
            }
            replaceValuesInMap('B','P');

            // We choose the smallest zone, the other one gets reset to F
            percentageCleared += replaceValuesInMap(zone1 < zone2 ? '1' : '2','E');
            replaceValuesInMap(zone1 < zone2 ? '2' : '1','F');

            // We replace all the paths with E, and then stroke the borders of all E area with P
            // this is for removing the path that was left enclosed in E area when the path was closed
            replaceValuesInMap('P','E');
            strokeAreaEdges(map, canvasW, 'E', 'P');

            // Handle points and notify engine
            percentageCleared = Math.round(percentageCleared/map.length * 100);
            addPointsByAreaCleared(percentageCleared);
            LP.engine.areaCleared(percentageCleared);
          }
        }
        else
        { // We are just drawing
          map[myPlayer.X + canvasW * myPlayer.Y] = 'T';
        }
      } else if (currentPoint === 'P'){
        // We are just walking on a path
        lastPathY = myPlayer.Y;
        lastPathX = myPlayer.X;
      } else if (previousPoint === 'T'){
        // We were drawing, but we stop without closing a path, just respawn
        respawn();
      } else {
        // We are not drawing, and we are trying to walk outside a path, we can't do that
        myPlayer.X = previousX;
        myPlayer.Y = previousY;      
      }

      // Don't put anything here, it won't execute if firing without moving

    };    

    myPlayer.render = function(canvasContext){  
      
      updatePlayerCanvasFromMap();
      canvasContext.drawImage(playerCanvas,0,0);      
      
      canvasContext.globalAlpha = haveJustDied ? 0.5 : 1;
      canvasContext.fillStyle = isFiring ? "orange" : "green";
      canvasContext.fillRect(myPlayer.X - width/2, myPlayer.Y - height/2, width, height);
      canvasContext.globalAlpha = 1;
    };

    myPlayer.getHitbox = function(){
      return {x: myPlayer.X - width/2, y: myPlayer.Y - width/2, width: width, height: height};
    };

    myPlayer.checkCollision = function(badguyHitbox, tFrame){
      if (!isFiring || haveJustDied || 
          (!areCollisioning(myPlayer.getHitbox(), badguyHitbox) &&
          !isCollisioningTemporalPath(badguyHitbox))) return false;

      // We got hit!
      --myPlayer.lifes;

      haveJustDied = true;
      dieTime = tFrame;
      respawn();

      LP.engine.showMessage("Ouch!");
      console.log("player hit. Remaining myPlayer.lifes: ", myPlayer.lifes, tFrame);
      if (myPlayer.lifes === 0) LP.engine.playerDied();
      return true;      
    };

    myPlayer.reset = function(){
      for (var i = map.length - 1; i >= 0; i--) {
        map[i] = 'F';
      }

      myPlayer.lifes = 3;
      haveJustDied = false;
      
      generateRandomClearedZone();
    }
    
    // Private functions

    function replaceValuesInMap(oldVal, newVal){
      var replacedCount = 0;
      for (var i = map.length - 1; i >= 0; i--) {
        if (map[i] === oldVal){
          map[i] = newVal;
          ++replacedCount;
        }          
      }

      return replacedCount;
    }
        
    function getMapCoordinate(x,y){
      return map[y * canvasW + x];
    }    

    function createCanvas(width, height) {
      var canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
            
      //document.body.appendChild(canvas);  
      
      return canvas;
    }

    function updatePlayerCanvasFromMap(){

      // TODO: This two lines can be taken out, the data is always the same
      // TODO: Maybe also an ArrayBuffer to improve speed
      // https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/
      var imgData = ctxPlayer.getImageData(0,0, canvasW, canvasH);
      var data = imgData.data;
      
      for (var i = map.length - 1; i >= 0; i--) {
        switch (map[i]){
          case 'E': // Empty
            data[i*4+3] = 0; // Transparent, don't care the color
            break;
          case 'F': // Filled
            data[i*4]   = 0; // Dark Blue, 100% opaque
            data[i*4+1] = 0;
            data[i*4+2] = 100;
            data[i*4+3] = 255;
            break;
          case 'P': // Path
            data[i*4]   = 255; // White, 100% opaque
            data[i*4+1] = 255;
            data[i*4+2] = 255;
            data[i*4+3] = 255;
            break;
          case 'T': // Temporal path
            data[i*4]   = 0; // Green, 100% opaque
            data[i*4+1] = 255;
            data[i*4+2] = 0;
            data[i*4+3] = 255;
            break;
        }
      }
          
      ctxPlayer.putImageData(imgData,0,0);
    };

    function generateRandomClearedZone(){
      var centerY = canvasH/2, 
          centerX = canvasW/2;

      // For now just create an empty cell right in the center, and eight path cells around
      // We do that in clockwise order starting at 12
      map[ centerY * canvasW + centerX ] = 'E';
      map[ (centerY - 1) * canvasW + centerX ] = 'P';
      map[ (centerY - 1) * canvasW + centerX + 1] = 'P';
      map[ centerY * canvasW + centerX + 1] = 'P';
      map[ (centerY + 1) * canvasW + centerX + 1] = 'P';
      map[ (centerY + 1) * canvasW + centerX ] = 'P';
      map[ (centerY + 1) * canvasW + centerX - 1] = 'P';
      map[ centerY * canvasW + centerX - 1] = 'P';
      map[ (centerY - 1) * canvasW + centerX - 1] = 'P';

      // Player starts at 12
      myPlayer.X = centerX;
      myPlayer.Y = centerY - 1;
      lastPathX = myPlayer.X;
      lastPathY = myPlayer.Y;
    }

    function floodFill(mapData, mapWidth, startingX, startingY, oldVal, newVal){
      
      var pixelStack = [{x: startingX, y: startingY}]; //the stack of pixels to check
      var pixelsFilled = 0;

      while (pixelStack.length > 0) 
      {
        var current = pixelStack.pop();
        var index = current.y * mapWidth + current.x;

        if(mapData[index] !== oldVal) continue;
    
        mapData[index] = newVal;
        pixelsFilled++;

        // We don't bother checking limits, undefined will be different from oldVal
        pixelStack.push({x: current.x+1, y: current.y   }); //right
        pixelStack.push({x: current.x-1, y: current.y   }); //left
        pixelStack.push({x: current.x,   y: current.y+1 }); //up
        pixelStack.push({x: current.x,   y: current.y-1 }); //down
      }

      console.log("Pixels filled", pixelsFilled);
      return pixelsFilled;
    }    

    function strokeAreaEdges(mapData, mapWidth, innerVal, borderVal){
      var x = 0,
          y = 0,
          left = undefined,
          top = undefined,
          right = undefined,
          bottom = undefined,
          topLeft = undefined,
          topRight = undefined,
          bottomLeft = undefined,
          bottomRight = undefined,
          pixelStack = [],
          mapHeight = mapData.length / mapWidth;

      for(y=0;y<mapHeight;y++){
        for(x=0;x<mapWidth;x++){
          index = (x + y * mapWidth);
          pixel = mapData[index];

          // We want to detect edges from the area with innerVal to the outside
          if (pixel !== innerVal) continue;

          // Get the values of the eight surrounding pixels      
          left = mapData[index-1];
          right = mapData[index+1];
          top = mapData[index - mapWidth];
          bottom = mapData[index + mapWidth];
          topLeft = mapData[index - mapWidth - 1];
          topRight = mapData[index - mapWidth + 1];
          bottomLeft = mapData[index + mapWidth - 1];
          bottomRight = mapData[index + mapWidth + 1];

          //Compare it all and save pixels to modify later, if we change them now, algorithm will get screwed
          if(pixel !== left || pixel !== right || pixel !== top || pixel !== bottom || 
             pixel !== topLeft || pixel !== topRight || pixel !== bottomLeft || pixel !== bottomRight){
              pixelStack.push(index);
          }   
        }
      }

      // We finally stroke (paint) the borders
      for (var i = pixelStack.length - 1; i >= 0; i--) {
        mapData[pixelStack[i]] = borderVal;
      }
    }

    function areCollisioning(rect1, rect2){
      //console.log("areCollisioning", rect1, rect2);
      return (rect1.x < rect2.x + rect2.width &&
              rect1.x + rect1.width > rect2.x &&
              rect1.y < rect2.y + rect2.height &&
              rect1.height + rect1.y > rect2.y);
    }

    function isCollisioningTemporalPath (badguyHitbox){

      var points = getTemporalPathPoints(),
          x1 = badguyHitbox.x,
          x2 = badguyHitbox.x + badguyHitbox.width,
          y1 = badguyHitbox.y,
          y2 = badguyHitbox.y + badguyHitbox.height;

      for (var i = points.length - 1; i >= 0; i--) {
         if ((x1 <= points[i].x) && (points[i].x <= x2) && 
             (y1 <= points[i].y) && (points[i].y <= y2)) {
           return true;
         }
      }

      return false;
    }

    function getTemporalPathPoints(){
      var points = [];

      if (!isFiring) return points;

      for (var i = map.length - 1; i >= 0; i--) {
        if (map[i] === 'T') {
          var y = i / canvasW;
          var x = i % canvasW;
          points.push({x: x, y: y });
        }
      }

      //console.log(points);
      return points;
    }

    // Resets the path and go back to last path known
    function respawn(){
      // Transform all temporal paths into filled
      replaceValuesInMap('T','F');
      myPlayer.X = lastPathX;
      myPlayer.Y = lastPathY;
    }

    function addPointsByAreaCleared(percentageCleared){
      var pointsMultiplier;

      if (percentageCleared <= 1){
        pointsMultiplier = 1;
      } else if (percentageCleared <= 2){
        pointsMultiplier = 3;
      } else if (percentageCleared <= 10){
        pointsMultiplier = 5;
      } else if (percentageCleared <= 50){
        pointsMultiplier = 10;
      } else if (percentageCleared <= 70){
        pointsMultiplier = 30;
      } else {
        pointsMultiplier = 50;
      }

      myPlayer.points += percentageCleared * pointsMultiplier;
    }

    // Init code

    var playerCanvas = createCanvas(canvasW, canvasH);
    var ctxPlayer = playerCanvas.getContext('2d'),
        map = new Array(canvasW*canvasH);

    return myPlayer;
  };
}(this.LP = this.LP || {}));
