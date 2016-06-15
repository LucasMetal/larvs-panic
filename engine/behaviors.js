(function(LP) {

	LP.behaviors = {
		
		wander: {
			create: function (enemy, player, canvasW, canvasH, speed, radius, changeCallback){
				var myBehavior = {},
			        lastDirectionChangeTime = 0,
	                lastBehaviorChangeTime = 0;

				myBehavior.onEnterState = function(){
					lastBehaviorChangeTime = null;
				};

				myBehavior.update = function (tFrame, dt){
					if (!lastBehaviorChangeTime) lastBehaviorChangeTime = tFrame;

					if (enemy.X - radius <= 0 || enemy.X + radius >= canvasW) enemy.directionX *= -1; 
					if (enemy.Y - radius <= 0 || enemy.Y + radius >= canvasH) enemy.directionY *= -1; 

					if (tFrame - lastDirectionChangeTime > (Math.random () * 5 + 4 ) * 1000){
					enemy.directionY = Math.random ();
					enemy.directionX = Math.random ();
					//if (Math.random() > 0.5) directionX *= -1;
					//if (Math.random() > 0.5) directionY *= -1;
					lastDirectionChangeTime = tFrame;
					}

					enemy.X += speed * enemy.directionX;
					enemy.Y += speed * enemy.directionY;

					if (changeCallback && (tFrame - lastBehaviorChangeTime > 10 * 1000)) changeCallback();
			    };

				myBehavior.onExitState = function(){};

				return myBehavior;
			}
		},

		seekAndBump: {
			create: function (enemy, player, canvasW, canvasH, speed, radius, changeCallback){
				var myBehavior = {};

				myBehavior.onEnterState = function(){};

				myBehavior.update = function (tFrame, dt){
			      var dx = player.X - enemy.X;
			      var dy = player.Y - enemy.Y;
			      var distance = Math.sqrt((dx*dx) + (dy*dy));
			      //this.angle = Math.atan2(this.dy,this.dx) * 180 / Math.PI;

			      // We normalize the vector
			      enemy.directionX = (dx/distance);
			      enemy.directionY = (dy/distance);

			      enemy.X += speed * enemy.directionX;
			      enemy.Y += speed * enemy.directionY;

			      if (changeCallback && LP.helpers.areColliding(player.getHitbox(), enemy.getHitbox())) changeCallback();
			    };

				myBehavior.onExitState = function(){};

				return myBehavior;
			}
		},

		multiFire: {
			create: function (enemy, player, canvasW, canvasH, speed, radius, changeCallback){
				var myBehavior = {
				        isFiring : false,
		                colorPercentage : 0,
	                    bullets : [],
					},
					haveJustFired = false;

				myBehavior.onEnterState = function(){
			        myBehavior.colorPercentage = 0;
			        haveJustFired = false;
			      	myBehavior.isFiring = true;			        
				};

				myBehavior.update = function (tFrame, dt){

			      if (myBehavior.colorPercentage < 1){
			        myBehavior.colorPercentage += (dt/2000);
			        return;
			      }

			      if (!haveJustFired){        
			        for (var angle = 0; angle <= 360; angle += 360/18){
			          // We find the coordinates of the normalized vector (legth = 1)
			          var bx = Math.sin(angle * Math.PI / 180);
			          var by = Math.cos(angle * Math.PI / 180);
			          fireBullet ( bx, by, tFrame);
			        } 
			      }

			      // Remove dead bullets and update live ones
			      for (var i = myBehavior.bullets.length - 1; i >= 0; i--) {
			        if (!myBehavior.bullets[i].alive){
			          myBehavior.bullets.splice(i,1);
			          continue;
			        } 

			        myBehavior.bullets[i].update(tFrame);
			      }

			      if (myBehavior.bullets.length === 0){
			        myBehavior.isFiring = false;
			        if (changeCallback) changeCallback();
			      }
			    }

				myBehavior.onExitState = function(){};

				// Private methods

				function fireBullet(xDirection, yDirection, tFrame){
			      //console.log('firing bullet', xDirection, yDirection);
			      myBehavior.bullets.push(LP.bullet(enemy.X, enemy.Y, xDirection, yDirection, canvasW, canvasH, player))
			      haveJustFired = true;
			    }

				return myBehavior;
			}
		}		
	};

}(this.LP = this.LP || {}));