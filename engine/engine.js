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
			messagesElement,
			lastStatsUpdateTime = 0,
			messageTimeoutHandle = null,
			clearedPercentage = 0,
			remainingTime = 180,
			lastFrameTime = 0,
			backgroundImgElement;
	
		// This method is initially called by onLoad event on index
		myEngine.init = function(canvasId, statsElementId, fpsMeterId, messagesElementId){
	
			console.log("init!");

			statsElement = document.getElementById(statsElementId);
			messagesElement = document.getElementById(messagesElementId);
			initializeCanvas(canvasId);			
			LP.initInput();
 			player = LP.player(10,10, canvasW, canvasH, LP.getInput());

			meter = new FPSMeter(document.getElementById(fpsMeterId), {position: 'absolute', theme: 'light', graph: 1, heat: 1});
			resetLevel();

			backgroundImgElement = new Image();
			backgroundImgElement.onload = function(){mainLoop();};
			//backgroundImgElement.src = "http://2.bp.blogspot.com/_wfgZeHnjCnc/SrpU5rgX8gI/AAAAAAAAAI4/ezQ3s5Zdbvk/s320/manga_6.jpg";
			backgroundImgElement.src = "http://1.bp.blogspot.com/_iknPwq_7NbI/STqxoG4oRsI/AAAAAAAAACE/tUuNOFtDz3o/s320/naruto01xk6%5B1%5D.jpg";
		};

		myEngine.playerDied = function(){
			console.log("Player died");
			myEngine.showMessage("You died :(");
			resetLevel();			
		};

		myEngine.areaCleared = function(percentage){
			clearedPercentage += percentage;

			if (clearedPercentage >= 80){
				console.log("Win!");
				myEngine.showMessage("You win!");
				resetLevel();
			}
		};

		myEngine.showMessage = function (message){			
			messagesElement.innerText = message;
			
			if (messageTimeoutHandle) clearTimeout(messageTimeoutHandle);
			messageTimeoutHandle = setTimeout(function(){messagesElement.innerText = ''}, 3 * 1000);
		}

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
			clearedPercentage = 0;
			player.reset();
			remainingTime = 180;

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

			if (tFrame - lastFrameTime > 1000){
				--remainingTime;				
				lastFrameTime = tFrame;

				if (remainingTime === 0){
					myEngine.playerDied();
				}
			}

			for (var i = actors.length - 1; i >= 0; i--) {
				actors[i].update(tFrame);
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
			c2d.drawImage(backgroundImgElement,0,0);

			// Useful maybe for debug
	      	//c2d.fillStyle = "red";
	      	//c2d.fillRect(0, 0, canvasW, canvasH);
		}

		function updateStats(tFrame){
			if (tFrame - lastStatsUpdateTime > 1000){
				statsElement.innerText = 'Lives: ' + player.lives + ' | Points: ' + player.points + ' | ' + clearedPercentage + '% | Time: ' + remainingTime; 
				lastStatsUpdateTime = tFrame;
			}
		}

		return myEngine;
	}();

}(this.LP = this.LP || {}));