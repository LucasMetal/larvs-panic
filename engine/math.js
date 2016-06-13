(function(LP) {

	LP.math = function(){
		var myMath = {};		

	    // Returns a random number between min (inclusive) and max (exclusive)
	    myMath.getRandomArbitrary = function(min, max) {
	      return Math.random() * (max - min) + min;
	    }

	    // Returns a random integer between min (included) and max (excluded)
	    // Using Math.round() will give you a non-uniform distribution!
	    myMath.getRandomInt = function(min, max) {
	      return Math.floor(Math.random() * (max - min)) + min;
	    }

	    // Precise method which guarantees result = b when t = 1.
	    myMath.lerp = function(a, b, t) {
  			return (1-t)*a + t*b;
		};

		return myMath;
	}();

}(this.LP = this.LP || {}));