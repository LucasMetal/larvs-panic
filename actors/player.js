function Player(x,y, canvasW, canvasH) {
  this.lifes = 3;
  this.speed = 1;
  this.X = x;
  this.Y = y;
  this.canvasW = canvasW;
  this.canvasH = canvasH;
  this.isFiring = false;
  this.width = 10;
  this.height = 10;
  this.previousX = x;
  this.previousY = y;
  this.paths = new Array();

  

  this.update = function(tFrame, input){
    this.previousX = this.X;
    this.previousY = this.Y;

    if (input.left && this.X > 0){
      this.X = Math.max(0, this.X - this.speed); 
    }

    if (input.right && ( this.X + this.width) < this.canvasW){
      this.X = Math.min(canvasW - this.width, this.X + this.speed); 
    }

    if (input.up && this.Y > 0){
      this.Y = Math.max(0, this.Y - this.speed); 
    }

    if (input.down && (this.Y + this.height) < this.canvasH){
      this.Y = Math.min(canvasH - this.height, this.Y + this.speed); 
    }

    this.isFiring = input.fire;

    if (this.isFiring){
      map[this.X + this.canvasW * this.Y] = 'P';
    }
  };

  this.render = function(canvasContext){

    var isPlayerInSomePath = false;

    /*
    if (this.isFiring){

      // Set line styles
      canvasContext.strokeStyle = 'white';
      canvasContext.lineWidth = 3;

      var path = new Path2D();
      path.moveTo(this.previousX, this.previousY);
      path.lineTo(this.X, this.Y);      
      this.paths.push(path);
    }
    */

    /*
    for (var i = this.paths.length - 1; i >= 0; i--) {
      canvasContext.stroke(this.paths[i]);

      if (canvasContext.isPointInPath(this.paths[i], this.X, this.Y)) isPlayerInSomePath = true;
    }
    */

    this.updatePlayerCanvasFromMap();
    canvasContext.drawImage(playerCanvas,0,0);

    canvasContext.fillStyle = this.isFiring ? "orange" : "black";
    //canvasContext.fillStyle = isPlayerInSomePath ? "orange" : "black";
    canvasContext.fillRect(this.X, this.Y, 10, 10);
  };

  function renderToCanvas(width, height, render, canvas) {
    canvas = canvas || createCanvas(width, height, canvas);
    render(canvas.getContext('2d'));
    return canvas;
  }

  this.createCanvas = function(width, height) {
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

  this.updatePlayerCanvasFromMap = function(){

    // TODO: This two lines can be taken out, the data is always the same
    // TODO: Maybe also an ArrayBuffer to improve speed
    // https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/
    var imgData = ctxPlayer.getImageData(0,0, this.canvasW, this.canvasH);
    var data = imgData.data;

    for (var i = map.length - 1; i >= 0; i--) {
      switch (map[i]){
        case 'E': // Empty
          data[i*4+3] = 0; // Transparent, don't care the color
          break;
        case 'F': // Filled
          data[i*4] = 0; // Blue, 100% opaque
          data[i*4+1] = 0;
          data[i*4+2] = 255;
          data[i*4+3] = 255;
          break;
        case 'P': // Path
          data[i*4] = 0; // White, 100% opaque // TODO: Make this 255
          data[i*4+1] = 255;
          data[i*4+2] = 255;
          data[i*4+3] = 255;
          break;
      }
    }
        
    ctxPlayer.putImageData(imgData,0,0);
  };

  var playerCanvas = this.createCanvas(canvasW, canvasH);
  var ctxPlayer = playerCanvas.getContext('2d'),
      map = new Array(canvasW*canvasH);

  for (var i = map.length - 1; i >= 0; i--) {
    map[i] = 'E';
  }
}