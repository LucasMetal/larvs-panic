(function(LP) {

	LP.engine = function(){    
	
		var myEngine = {},
			c2d,
			canvasH,
			canvasW,
			player,
			enemies,
			meter,
			statsElement,
			messagesElement,
			lastStatsUpdateTime = 0,
			messageTimeoutHandle = null,
			clearedPercentage = 0,
			remainingTime = 180,
			lastFrameTime = 0,
			lastRemaningTimeFrameTime = 0,
			backgroundImgElement,
			nextAddTimePercentage = 30;
	
		// This method is initially called by onLoad event on index
		myEngine.init = function(canvasId, statsElementId, fpsMeterId, messagesElementId){
	
			console.log("init!");

			statsElement = document.getElementById(statsElementId);
			messagesElement = document.getElementById(messagesElementId);
			initializeCanvas(canvasId);			
			LP.initInput();
 			player = LP.player(canvasW, canvasH, LP.getInput());

			meter = new FPSMeter(document.getElementById(fpsMeterId), {position: 'absolute', theme: 'light', graph: 1, heat: 1});
			resetLevel();

			backgroundImgElement = new Image();
			backgroundImgElement.onload = function(){mainLoop(0);};
			//backgroundImgElement.src = "http://2.bp.blogspot.com/_wfgZeHnjCnc/SrpU5rgX8gI/AAAAAAAAAI4/ezQ3s5Zdbvk/s320/manga_6.jpg";
			//backgroundImgElement.src = "http://1.bp.blogspot.com/_iknPwq_7NbI/STqxoG4oRsI/AAAAAAAAACE/tUuNOFtDz3o/s320/naruto01xk6%5B1%5D.jpg"; //320x240
			backgroundImgElement.src = "http://lh3.ggpht.com/-2iOwRLn7L2o/R-AmdcBZ2EI/AAAAAAAAAOY/f2T1ClJMoBE/Manga-image-tres-belle-fille-01263.jpg"; //512x384
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

			if (clearedPercentage >= nextAddTimePercentage){
				remainingTime += 30;
				nextAddTimePercentage += 10; // We add time each 10 now
				myEngine.showMessage("Extra time!");
				console.log("Extra time added");
			};

			verifyEnclosedEnemies();
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
			// We do a little trick here to double everything, we create a normal canvas but tell the game its dimension is half the real one
			// then we scale everything to the double. That way we have bigger objects without changing the game logic.
			canvasW = canvas.width/2;
			canvasH = canvas.height/2;
			c2d.scale(2,2);
			console.log('canvas initialized');
  		}
	
  		function resetLevel(){
  			enemies = [];
			clearedPercentage = 0;
			player.reset();
			remainingTime = 180;

			enemies.push (LP.circleEnemy (canvasW, canvasH, player));
			enemies.push (LP.circleBumper(canvasW, canvasH, player));
			enemies.push (LP.circleBumper(canvasW, canvasH, player));
  		}

		function mainLoop (tFrame) {
    		update( tFrame ); //Call your update method. In our case, we give it rAF's timestamp.
    		render();
			window.requestAnimationFrame( mainLoop );
		};

		function update(tFrame){
			updateStats(tFrame);

			if (tFrame - lastRemaningTimeFrameTime > 1000){
				--remainingTime;				
				lastRemaningTimeFrameTime = tFrame;

				if (remainingTime === 0){
					myEngine.playerDied();
				} else if (remainingTime === 30){
					myEngine.showMessage("Hurry up!!");
				}
			}

			for (var i = enemies.length - 1; i >= 0; i--) {
				enemies[i].update(tFrame, tFrame - lastFrameTime);
			}

			player.update(tFrame, tFrame - lastFrameTime);

			//console.log("update!!");
			lastFrameTime = tFrame;
		}

		function render(){

			renderBackground();

			player.render(c2d);

			for (var i = enemies.length - 1; i >= 0; i--) {
				if (!enemies[i].alive){
		          enemies.splice(i,1);
		          continue;
		        }

				enemies[i].render(c2d);
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

		function verifyEnclosedEnemies(){
			var emptyPoints = player.getEmptyMapPoints();
			for (var i = enemies.length - 1; i >= 0; i--) {
				if (LP.helpers.isCollidingPoints(enemies[i].getHitbox(),emptyPoints)){
					enemies[i].die();
					player.points += 200;
				}
			}
		}

		return myEngine;
	}();

}(this.LP = this.LP || {}));