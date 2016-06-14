(function(LP) {

	LP.helpers = function(){
		var myHelpers = {};

		myHelpers.areColliding = function(rect1, rect2){
	      //console.log("areColliding", rect1, rect2);
	      return (rect1.x < rect2.x + rect2.width &&
	              rect1.x + rect1.width > rect2.x &&
	              rect1.y < rect2.y + rect2.height &&
	              rect1.height + rect1.y > rect2.y);
	    }

        myHelpers.isCollidingPoints = function(rect, points){
	      var x1 = rect.x,
	          x2 = rect.x + rect.width,
	          y1 = rect.y,
	          y2 = rect.y + rect.height;

	      for (var i = points.length - 1; i >= 0; i--) {
	         if ((x1 <= points[i].x) && (points[i].x <= x2) && 
	             (y1 <= points[i].y) && (points[i].y <= y2)) {
	           return true;
	         }
	      }

	      return false;
	    }

	    return myHelpers;
	}();

}(this.LP = this.LP || {}));