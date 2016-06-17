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

	    // http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object/122190#122190
	    myHelpers.clone = function (obj) {
	      if (obj === null || typeof(obj) !== 'object' || 'isActiveClone' in obj)
	        return obj;

	      if (obj instanceof Date)
	        var temp = new obj.constructor(); //or new Date(obj);
	      else
	        var temp = obj.constructor();

	      for (var key in obj) {
	        if (Object.prototype.hasOwnProperty.call(obj, key)) {
	          obj['isActiveClone'] = null;
	          temp[key] = myHelpers.clone(obj[key]);
	          delete obj['isActiveClone'];
	        }
	      }

	      return temp;
	    }

	    return myHelpers;
	}();

	// From "Javascript, the good parts"
	Object.prototype.superior = function (name) {
		var that = this,
			method = that[name];
		return function ( ) {
			return method.apply(that, arguments);
		};
	};

}(this.LP = this.LP || {}));