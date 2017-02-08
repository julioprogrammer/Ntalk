var express        = require('express')
  , cookieParser   = require('cookie-parser')
  , session        = require('express-session')
  , load           = require('express-load')
  , bodyParser     = require('body-parser')
  , methodOverride = require('method-override')
  , app            = express()
  , error          = require('./middleware/error')
  , server         = require('http').createServer(app)
  , io             = require('socket.io').listen(server);


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(cookieParser('ntalk'));
app.use(session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());
app.use(app.router);
app.use(express.static(__dirname + '/public'));
app.use(error.notFound);
app.use(error.serverError);

// ...stack de configurações do servidor
load('models')
    .then('controllers')
    .then('routes')
    .into(app);

io.sockets.on('connection', function (client) {
  client.on('send-server', function (data) {
    var msg = "<b>"+data.nome+":</b> "+data.msg+"<br>";
    client.emit('send-client', msg);
    client.broadcast.emit('send-client', msg);
  });
});

// ...app.listen(3000)
server.listen(3000, function(){
  console.log("Ntalk no ar");
});
