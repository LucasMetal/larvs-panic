(function(LP) {

	console.log("init!");

	var c2d,
		canvasH,
		canvasW,
		actors = new Array(),
		meter;

	// This method is initially called by onLoad event on index
	LP.init = function(canvasId){

		initializeCanvas(canvasId);

		actors.push (LP.circleEnemy(10,10, canvasW, canvasH));
		actors.push (LP.player(10,10, canvasW, canvasH));

		LP.initInput();

		meter = new FPSMeter();

		main();
	};

  	function initializeCanvas(canvasId) {
		var canvas = document.getElementById('canvas');
		c2d = canvas.getContext('2d');
		c2d.lineWidth = 1;
		c2d.globalAlpha = 1;
		c2d.globalCompositeOperation = 'source-over';
		canvasW = canvas.width;
		canvasH = canvas.height;
		console.log('canvas initialized');
  	}	

	function main (tFrame) {
    	update( tFrame ); //Call your update method. In our case, we give it rAF's timestamp.
    	render();
		window.requestAnimationFrame( main );
	};

	function update(tFrame){

		for (var i = actors.length - 1; i >= 0; i--) {
			actors[i].update(tFrame, LP.getInput());
		}
		//console.log("update!!");
	}

	function render(){

		renderBackground();

		for (var i = actors.length - 1; i >= 0; i--) {
			actors[i].render(c2d);
		}
		//console.log("render!!");
		meter.tick();
	}

	function renderBackground() {
		// TODO: Render an image
      	c2d.fillStyle = "red";
      	c2d.fillRect(0, 0, canvasW, canvasH);
	}

}(this.LP = this.LP || {}));