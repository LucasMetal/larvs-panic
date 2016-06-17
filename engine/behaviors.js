(function(LP) {

	LP.behaviors = {

		behavior : function(enemy, changeCallback){
			var that = {};

			that.onEnterState = function(){};
			that.update = function(tFrame, dt){};
			that.onExitState = function(){};
			
			return that;
		},
		
		wander: function (enemy, changeCallback){
			var that = LP.behaviors.behavior(enemy, changeCallback),
		        lastDirectionChangeTime = 0,
                lastBehaviorChangeTime = 0;

			that.onEnterState = function(){
				lastBehaviorChangeTime = null;
			};

			that.update = function (tFrame, dt){
				if (!lastBehaviorChangeTime) lastBehaviorChangeTime = tFrame;

				if (enemy.x - enemy.radius <= 0 || enemy.x + enemy.radius >= enemy.canvasW) enemy.directionX *= -1; 
				if (enemy.y - enemy.radius <= 0 || enemy.y + enemy.radius >= enemy.canvasH) enemy.directionY *= -1; 

				if (tFrame - lastDirectionChangeTime > (Math.random () * 5 + 4 ) * 1000){
					enemy.directionY = Math.random ();
					enemy.directionX = Math.random ();
					//if (Math.random() > 0.5) directionX *= -1;
					//if (Math.random() > 0.5) directionY *= -1;
					lastDirectionChangeTime = tFrame;
				}

				// return; // uncomment to freeze enemies
				enemy.x += enemy.speed * enemy.directionX;
				enemy.y += enemy.speed * enemy.directionY;

				if (changeCallback && (tFrame - lastBehaviorChangeTime > 10 * 1000)) changeCallback();
		    };

			return that;		
		},

		seekAndBump: function (enemy, changeCallback){
			var that = LP.behaviors.behavior(enemy, changeCallback);

			that.update = function (tFrame, dt){

				var dx = enemy.player.x - enemy.x;
				var dy = enemy.player.y - enemy.y;
				var distance = Math.sqrt((dx*dx) + (dy*dy));
				//this.angle = Math.atan2(this.dy,this.dx) * 180 / Math.PI;

				// We normalize the vector
				enemy.directionX = (dx/distance);
				enemy.directionY = (dy/distance);

				enemy.x += enemy.speed * enemy.directionX;
				enemy.y += enemy.speed * enemy.directionY;

				// TODO: Fix getting stuck
				// If we have a changeCallback defined and have collided the player or we are touching the path (we are getting stuck)
				// we change behavior
				if (changeCallback && (LP.helpers.areColliding(enemy.player.getHitbox(), enemy.getHitbox()) || 
					enemy.player.isCollidingPath(enemy.getHitbox()))) changeCallback();
		    };

			return that;			
		},

		multiFire: function (enemy, changeCallback){
			var that = LP.behaviors.behavior(enemy, changeCallback);
			that.isFiring = false;
            that.colorPercentage = 0;
			that.bullets = [];					
			var haveJustFired = false;

			that.onEnterState = function(){
		        that.colorPercentage = 0;
		        haveJustFired = false;
		      	that.isFiring = true;			        
			};

			that.update = function (tFrame, dt){

		      if (that.colorPercentage < 1){
		        that.colorPercentage += (dt/2000);
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
		      for (var i = that.bullets.length - 1; i >= 0; i--) {
		        if (!that.bullets[i].alive){
		          that.bullets.splice(i,1);
		          continue;
		        } 

		        that.bullets[i].update(tFrame);
		      }

		      if (that.bullets.length === 0){
		        that.isFiring = false;
		        if (changeCallback) changeCallback();
		      }
		    }

			// Private methods

			function fireBullet(xDirection, yDirection, tFrame){
		      //console.log('firing bullet', xDirection, yDirection);
		      that.bullets.push(LP.bullet(enemy.x, enemy.y, xDirection, yDirection, enemy.canvasW, enemy.canvasH, enemy.player))
		      haveJustFired = true;
		    }

			return that;		
		},

		die: function (enemy, changeCallback){
			var that = LP.behaviors.behavior(enemy, changeCallback);
			that.isDying = true;
			that.colorPercentage = 0;
			var dead = false;				

			that.update = function (tFrame, dt){
				if (that.colorPercentage < 1){
					that.colorPercentage += (dt/1000);
					return;
				}
				else {
					if (!dead && changeCallback) changeCallback();
					dead = true;
				}
		    }			

			return that;		
		}

	};

}(this.LP = this.LP || {}));