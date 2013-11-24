var http = require('http'),
    sockjs = require('sockjs'),
    node_static = require('node-static'),
    echo = sockjs.createServer();

function parse(string){
  var chunks = string.split('$');

  var price = chunks[1] || 0;
  return { text: chunks[0], price: price };
}

echo.on('connection', function(connection){
  connection.on('data', function(data){

    connection.write(JSON.stringify(parse(data)));
  });

  connection.on('close', function(){
    console.log('Closing connections');
  });
});

var static_directory = new node_static.Server(__dirname);
console.log('Static server in ' + __dirname);

var server = http.createServer(function(req, res){
  req.on('end', function(){
    static_directory.serve(req, res);
  }).resume();
});

echo.installHandlers(server, { prefix: '/list'});
server.listen(4000, '0.0.0.0');

console.log('HTTP Server started on port 4000');
