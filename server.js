var http = require('http'),
    sockjs = require('sockjs'),
    node_static = require('node-static'),
    echo = sockjs.createServer(),
    parts = [],
    connections = [];

function parse(string){
  if(string.length === 0){
    return null;
  }

  var chunks = string.split('$');

  if(isNaN(Number(chunks[1]))){
    return null;
  }

  return { text: chunks[0], price: chunks[1] };
}

function addPart(string){
  var part = parse(string);
  if(part){
    connections.forEach(function(conn){
      conn.write(JSON.stringify({type: 'add', part: part}));
    });
    parts.push(part);
  }
}

function deletePart(connection, part){
  var index = parts.indexOf(part);

  connections.forEach(function(conn){
    conn.write(JSON.stringify({type: 'delete', part: part}));
  });

  parts.splice(index, 1);
}

echo.on('connection', function(connection){
  connections.push(connection);

  connection.write(JSON.stringify({type: 'list', parts:  parts}));

  connection.on('data', function(data){
    var partEvent = JSON.parse(data);

    if(partEvent.type === 'add'){
      addPart(partEvent.text);
    }
    if(partEvent.type === 'delete'){
      deletePart(connection, partEvent.part);
    }
  });

  connection.on('close', function(){
    console.log('Closing connections');

    var connectionIndex = connections.indexOf(connection);
    connections.splice(connection, 1);
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
