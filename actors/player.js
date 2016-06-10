(function(LP) {

  LP.player = function (x,y, canvasW, canvasH) {
    var myPlayer = {};
        lifes = 3,
        speed = 1,
        X = x,
        Y = y,
        canvasW = canvasW,
        canvasH = canvasH,
        isFiring = false,
        width = 10,
        height = 10,
        previousX = x,
        previousY = y;
        paths = new Array(),
        lastPathX = x,
        lastPathY = y;

    myPlayer.update = function(tFrame, input){
      previousX = X;
      previousY = Y;

      if (input.left && X > 0){
        X = Math.max(0, X - speed); 
      }

      if (input.right && ( X + width) < canvasW){
        X = Math.min(canvasW - width, X + speed); 
      }

      if (input.up && Y > 0){
        Y = Math.max(0, Y - speed); 
      }

      if (input.down && (Y + height) < canvasH){
        Y = Math.min(canvasH - height, Y + speed); 
      }

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
            console.log("path close!", previousPoint);
            // Transform all temporal paths into final paths
            for (var i = map.length - 1; i >= 0; i--) {
              if (map[i] === 'T') map[i] = 'P';
            }            
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
        for (var i = map.length - 1; i >= 0; i--) {
          if (map[i] === 'T') map[i] = 'F';
        }
        X = lastPathX;
        Y = lastPathY;
      } else {
        // We are not drawing, and we are trying to walk outside a path, we can't do that
        X = previousX;
        Y = previousY;      
      }
    };

    myPlayer.render = function(canvasContext){

      var isPlayerInSomePath = false;
      
      /*
      if (isFiring){
      
        // Set line styles
        canvasContext.strokeStyle = 'white';
        canvasContext.lineWidth = 3;
      
        var path = new Path2D();
        path.moveTo(previousX, previousY);
        path.lineTo(X, Y);      
        paths.push(path);
      }
      */
      
      /*
      for (var i = paths.length - 1; i >= 0; i--) {
        canvasContext.stroke(paths[i]);
      
        if (canvasContext.isPointInPath(paths[i], X, Y)) isPlayerInSomePath = true;
      }
      */
      
      updatePlayerCanvasFromMap();
      canvasContext.drawImage(playerCanvas,0,0);
      
      canvasContext.fillStyle = isFiring ? "orange" : "black";
      //canvasContext.fillStyle = isPlayerInSomePath ? "orange" : "black";
      canvasContext.fillRect(X, Y, 10, 10);
    };
    
    // Private functions
        
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
    };

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
            data[i*4]   = 0; // Blue, 100% opaque
            data[i*4+1] = 0;
            data[i*4+2] = 255;
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
      X = centerX;
      Y = centerY - 1;
      lastPathX = X;
      lastPathY = Y;
    }
    
    // Init code

    var playerCanvas = createCanvas(canvasW, canvasH);
    var ctxPlayer = playerCanvas.getContext('2d'),
        map = new Array(canvasW*canvasH);
    
    for (var i = map.length - 1; i >= 0; i--) {
      map[i] = 'F';
    }

    generateRandomClearedZone();
    
    return myPlayer;
  };
}(this.LP = this.LP || {}));
