(function(LP) {

  LP.player = function (options, my) {
    // We know the player is square, but we use radius to reuse all the code
    options.radius = options.radius || 5;
    
    var my = my || {};
    my.name = my.name || "player";

    var that = LP.gameObject (options, my),
        input = options.input;
    that.lives = options.lives || 3;
    that.points = 0;
        
    var lastPathX = 0,
        lastPathY = 0,
        isFiring = false,
        haveJustDied = false,
        dieTime = null,        
        mapPointsCache = {};        

    function update(tFrame, dt){

      // If 5 seconds passed since we day, we are fully back in life now ;)
      if (haveJustDied && (tFrame - dieTime > 5 * 1000)){
        that.log("haveJustDied set to false");
        haveJustDied = false;
      }

      that.previousX = that.x;
      that.previousY = that.y;

      if (input.left && that.x > 0){
        that.x = Math.max(0, that.x - that.speed); 
      }

      if (input.right && that.x < that.canvasW){
        that.x = Math.min(that.canvasW, that.x + that.speed); 
      }

      if (input.up && that.y > 0){
        that.y = Math.max(0, that.y - that.speed); 
      }

      if (input.down && that.y < that.canvasH){
        that.y = Math.min(that.canvasH, that.y + that.speed); 
      }

      isFiring = input.fire;

      var previousPoint = map[that.previousX + that.canvasW * that.previousY]; 
      var currentPoint = map[that.x + that.canvasW * that.y];
   
      // If it's firing we update the path, otherwise he can't move outside
      if (isFiring){

        // Nothing more to calculate
        if (that.previousX === that.x && that.previousY === that.y) return;

        if (currentPoint === 'T' || currentPoint === 'E'){
            // We have bit our own tail or the pixel was empty
            //that.log("tail bit or empty pixel");
            that.x = that.previousX;
            that.y = that.previousY;
        } else if (currentPoint === 'P'){

          lastPathY = that.y;
          lastPathX = that.x;
        
          if (previousPoint !== 'P'){            
            that.log("path closed!", previousPoint);
            // Transform all temporal paths into final paths
            // Bug Handling /////////////////////////////////////////////////////////
            // TODO: Fix previous position selection: That's why we are transforming it to B, so we can revert it
            var percentageCleared = replaceValuesInMap('T','B'); // last param should be P
            // Bug Handling -END /////////////////////////////////////////////////////////

            /*
            Now we need to fill the enclosed area, but we can't distinguish between the enclosed and the outer one.
            So we floodFill both of them, and assume the smallest was the enclosed one.

            In order to flood both areas we need a starting point in each of them, to find them we must go back the temporal
            path the user was drawing and look at each side of it, the first point at each side of the temporal will be our starting points.

            To do all this, we are gonna find vectors (unit vectors), that applied to the point previous to contact (that.previousX, that.previousY)
            will take us to the flood starting points.

            Going back the temporal path means finding a vector with same direction as the path, but inverted. Then, finding the starting 
            flood points at the sides means finding two vectors ortogonal to the first one (we are gona find one, and invert the direction).
            */

            // We find the unit vector that represents the player movement, and invert its direction, so we can use it to go back the path
            var dx = (that.x - that.previousX) * -1;
            var dy = (that.y - that.previousY) * -1;

            // To find an ortogonal vector to a given vector, the easiest way is to swap the coordinates of the given vector and invert
            // one of them (not both), if you invert one of the them each time, you end up with two ortogonal vectors (that's what we do).
            // Ie: v = (5,3), vo1 = (-3,5), vo2 = (3,-5), vo1 and vo2 are ortogonal to v.

            // We fill two zones, for each one we are gonna do 3 tries (going back one more step each time).
            // We start from the point previous to contact (that.previousX, that.previousY), apply the vector to go back (as many steps as required),
            // and then apply the ortogonal vector to arrive at the flood starting point.
            var zone1 = 0;
            for (var backSteps = 0; backSteps < 3; ++backSteps){
              // (pX + backX * backSteps - ortogonalBackY, that.previousY + backY * steps + ortogonalBackX)
              zone1 += floodFill(map, that.canvasW, (that.previousX + dx * backSteps) - dy, (that.previousY + dy * backSteps) + dx, 'F', '1');
            }

            var zone2 = 0;
            for (var backSteps = 0; backSteps < 3; ++backSteps){
              // (pX + backX * backSteps + ortogonalBackY, that.previousY + backY * steps - ortogonalBackX)
              zone2 += floodFill(map, that.canvasW, (that.previousX + dx * backSteps) + dy, (that.previousY + dy * backSteps) - dx, 'F', '2');
            }          

            // Bug Handling /////////////////////////////////////////////////////////
            // TODO: Fix previous position selection, this is a hack so the bug doesn't occur, but gameplay gets affected
            if (zone1 === 0 || zone2 === 0){
              
              map[that.y * that.canvasW + that.x] = 'X'
              for (var i = 0; i < map.length; i += that.canvasW) {
                that.log(map.slice(i, i+that.canvasW).join(""));
              }
              map[that.y * that.canvasW + that.x] = 'P'

              replaceValuesInMap('1','F'); // Back to T, so respawn removes it
              replaceValuesInMap('2','F'); // Back to T, so respawn removes it
              replaceValuesInMap('B','T'); // Back to T, so respawn removes it
              respawn();
              LP.engine.showMessage("Sorry, I should fix that bug!");
              return;
            }
            replaceValuesInMap('B','P');
            // Bug Handling - END /////////////////////////////////////////////////////

            // We choose the smallest zone, the other one gets reset to F
            percentageCleared += replaceValuesInMap(zone1 < zone2 ? '1' : '2','E');
            replaceValuesInMap(zone1 < zone2 ? '2' : '1','F');

            // We replace all the paths with E, and then stroke the borders of all E area with P
            // this is for removing the path that was left enclosed in E area when the path was closed
            replaceValuesInMap('P','E');
            strokeAreaEdges(map, that.canvasW, 'E', 'P');

            // Handle game points and notify engine
            percentageCleared = Math.round(percentageCleared/map.length * 100);
            addPointsByAreaCleared(percentageCleared);
            LP.engine.areaCleared(percentageCleared);
          }
        }
        else
        { // We are just drawing
          map[that.x + that.canvasW * that.y] = 'T';
          clearMapPointsCache();
        }
      } else if (currentPoint === 'P'){
        // We are just walking on a path
        lastPathY = that.y;
        lastPathX = that.x;
      } else if (previousPoint === 'T'){
        // We were drawing, but we stop without closing a path, just respawn
        respawn();
      } else {
        // We are not drawing, and we are trying to walk outside a path, we can't do that
        that.x = that.previousX;
        that.y = that.previousY;      
      }

      // Don't put anything here, it won't execute if firing without moving
    }

    function render(canvasContext){
      updatePlayerCanvasFromMap();
      canvasContext.drawImage(playerCanvas,0,0);
      
      canvasContext.globalAlpha = haveJustDied ? 0.5 : 1;
      canvasContext.fillStyle = isFiring ? "orange" : "green";
      canvasContext.fillRect(that.x - that.radius, that.y - that.radius, that.radius*2, that.radius*2);
      canvasContext.globalAlpha = 1;
    }

    function checkCollision(badguyHitbox, tFrame){
      if (!isFiring || haveJustDied || 
          (!LP.helpers.areColliding(that.getHitbox(), badguyHitbox) &&
          !isCollidingTemporalPath(badguyHitbox))) return false;

      // We got hit!
      --that.lives;

      haveJustDied = true;
      dieTime = tFrame;
      respawn();

      LP.engine.showMessage("Ouch!");
      that.log("Hit! Remaining lives: ", that.lives, tFrame);
      if (that.lives === 0) LP.engine.playerDied();
      return true;      
    }

    function reset(){
      replaceValuesInMap(null, 'F')

      that.lives = 3;
      haveJustDied = false;
      
      generateRandomClearedZone();
    }

    function isCollidingPath(badguyHitbox){
      return LP.helpers.isCollidingPoints(badguyHitbox, getMapPoints('P'));
    }

    function getFilledMapPoints(){
      return getMapPoints('F');
    }

    function getEmptyMapPoints(){
      return getMapPoints('E');
    }

    function replaceValuesInMap(oldVal, newVal){
      var replacedCount = 0;
      for (var i = map.length - 1; i >= 0; i--) {
        if (!oldVal || map[i] === oldVal){
          map[i] = newVal;
          ++replacedCount;
        }          
      }

      if (replacedCount > 0) clearMapPointsCache();
      return replacedCount;
    }        

    function createCanvas(width, height) {
      var canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
            
      //document.body.appendChild(canvas);  
      
      return canvas;
    }

    function updatePlayerCanvasFromMap(){
      // TODO: Maybe also an ArrayBuffer to improve that.speed
      // https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/
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
      // We generate a random cleared zone of a random width and height between 2 and 15% of the canvas dimensions
      var width  = Math.floor(that.canvasW * LP.math.getRandomArbitrary(0.02, 0.15)),
          height = Math.floor(that.canvasH * LP.math.getRandomArbitrary(0.02, 0.15)),
          x = LP.math.getRandomInt(0, that.canvasW - that.radius), 
          y = LP.math.getRandomInt(0, that.canvasH - that.radius),
          pixelsCleared = 0;
      that.log("generateRandomClearedZone",x,y,width,height);

      for (var xIndex = x; xIndex < x+width; xIndex++){ 
        for (var yIndex = y; yIndex < y+height; yIndex++){
          map[ yIndex * that.canvasW + xIndex ] = 'E';
          ++pixelsCleared;
        }
      }

      strokeAreaEdges(map, that.canvasW, 'E', 'P')

      that.x = x;
      that.y = y;
      lastPathX = that.x;
      lastPathY = that.y;

      LP.engine.areaCleared(Math.round(pixelsCleared/map.length*100));
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

      clearMapPointsCache();
      //that.log("Pixels filled", pixelsFilled);
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
          left        = mapData[index - 1];
          right       = mapData[index + 1];
          top         = mapData[index - mapWidth];
          bottom      = mapData[index + mapWidth];
          topLeft     = mapData[index - mapWidth - 1];
          topRight    = mapData[index - mapWidth + 1];
          bottomLeft  = mapData[index + mapWidth - 1];
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
      clearMapPointsCache();
    }    

    function isCollidingTemporalPath (badguyHitbox){
      return isFiring ? LP.helpers.isCollidingPoints(badguyHitbox, getMapPoints('T')) : false;
    }

    function getMapPoints(type){
      if (mapPointsCache[type]) return mapPointsCache[type];

      var points = [];

      for (var i = map.length - 1; i >= 0; i--) {
        if (map[i] === type) {
          var y = i / that.canvasW;
          var x = i % that.canvasW;
          points.push({x: x, y: y });
        }
      }

      //that.log(points);
      mapPointsCache[type] = points;
      return points;
    }

    // Resets the path and go back to last path known
    function respawn(){
      // Transform all temporal paths into filled
      replaceValuesInMap('T','F');
      that.x = lastPathX;
      that.y = lastPathY;
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

      that.points += percentageCleared * pointsMultiplier;
    }

    function clearMapPointsCache(){
      mapPointsCache = {};
    }

    // Init code

    var playerCanvas = createCanvas(that.canvasW, that.canvasH),
        ctxPlayer = playerCanvas.getContext('2d'),
        map = new Array(that.canvasW*that.canvasH),
        imgData = ctxPlayer.getImageData(0,0, that.canvasW, that.canvasH);

    that.update = update;
    that.render = render;
    that.checkCollision = checkCollision;
    that.reset = reset;
    that.isCollidingPath = isCollidingPath;
    that.getFilledMapPoints = getFilledMapPoints;
    that.getEmptyMapPoints = getEmptyMapPoints;   

    return that;
  };
}(this.LP = this.LP || {}));
