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

	    return myHelpers;
	}();

}(this.LP = this.LP || {}));