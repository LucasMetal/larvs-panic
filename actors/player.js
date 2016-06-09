function Player(x,y, canvasW, canvasH) {
  this.lifes = 3;
  this.speed = 8;
  this.X = x;
  this.Y = y;
  this.canvasW = canvasW;
  this.canvasH = canvasH;
  this.isFiring = false;
  this.width = 10;
  this.height = 10 

  this.update = function(tFrame, input){
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
  };

  this.render = function(canvasContext){

    canvasContext.fillStyle = this.isFiring ? "orange" : "black";
    canvasContext.fillRect(this.X, this.Y, 10, 10) 	
  };
}