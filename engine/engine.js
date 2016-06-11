(function(LP) {

	LP.engine = function(){    
	
		var myEngine = {},
			c2d,
			canvasH,
			canvasW,
			player,
			actors,
			meter,
			statsElement,
			lastStatsUpdateTime = 0,
			clearedPercentage = 0,
			remainingTime = 30;
	
		// This method is initially called by onLoad event on index
		myEngine.init = function(canvasId, statsElementId, fpsMeterId){
	
			console.log("init!");

			statsElement = document.getElementById(statsElementId);
			initializeCanvas(canvasId);			
			LP.initInput();

			meter = new FPSMeter(document.getElementById(fpsMeterId), {position: 'absolute', theme: 'light', graph: 1, heat: 1});

			resetLevel();

			mainLoop();
		};

		myEngine.playerDied = function(){
			console.log("Player died");
			resetLevel();
		};

		// Private functions
	
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
	
  		function resetLevel(){
  			actors = [];
			player = LP.player(10,10, canvasW, canvasH);

			actors.push (LP.circleEnemy(10,10, canvasW, canvasH, player));
			actors.push (player);
  		}

		function mainLoop (tFrame) {
    		update( tFrame ); //Call your update method. In our case, we give it rAF's timestamp.
    		render();
			window.requestAnimationFrame( mainLoop );
		};

		function update(tFrame){
			updateStats(tFrame);

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

		function updateStats(tFrame){
			if (tFrame - lastStatsUpdateTime > 1000){
				statsElement.innerText = 'Lifes: ' + player.lifes + ' | Points: ' + player.points + ' | ' + clearedPercentage + '% | Time: ' + remainingTime; 
				lastStatsUpdateTime = tFrame;
			}
		}

		return myEngine;
	}();

}(this.LP = this.LP || {}));