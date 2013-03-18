var async = require('async'),
	path = require('path');

// an example using an object instead of an array
async.parallel({
    one: function(callback){
        setTimeout(function(){
            callback(null, 1);
        }, 200);
		// for (var i=0;i<10000;i++)
			// console.log(i);
    },
    two: function(callback){
        setTimeout(function(){
            callback(null, 2);
        }, 100);
    }
},
function(err, results) {
	console.log(results);
    // results is now equals to: {one: 1, two: 2}
});

console.log('async ok');