var async = require('async');

var times = [200,500,100,10];

function loging(time, callback){
	setTimeout(function(){
            console.log('ok ' + time);
			callback(null);
        }, time);
		// for (var i=0;i<10;i++)
			// console.log(i);
}
	
async.each(times, loging, function(err){
    console.log('all async ok');
});

console.log('async ok');

/*
var files = ['file1', 'file2', 'file3'];

async.filter(files, path.exists, function(results){
    if(results) sys.puts('The following files already exist: ' + results);
});



Without the async module
var files = ['file1', 'file2', 'file3'],
    results = [],
    completed = 0;

files.forEach(function(f){
    path.exists(f, function(exists){
        if(exists) results.push(f);
        completed++;
        if(completed == files.length){
            if(results){
                sys.puts('The following files already exist: ' + results);
            }
        }
    });
});

*/