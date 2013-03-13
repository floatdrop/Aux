var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs');

var mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css"};

function start(port){
    http.createServer(function(req, res) {
        
        var uri = url.parse(req.url).pathname;
        if (uri == '/') uri = "index.html";
        var extname = path.extname(uri).split(".")[1];
        var filename = path.join("../client", uri);

        path.exists(filename, function(exists) {
            if(!exists) {
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end('404 Not Found\n');
                return;
            }

            res.writeHead(200, mimeTypes[extname]);
            var fileStream = fs.createReadStream(filename);
            fileStream.pipe(res);
        });
    }).listen(port);
}

exports.start = start;