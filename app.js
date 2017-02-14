const KEY = 'ntalk.sid', SECRET = 'ntalk';
var express        = require('express')
  , cookieParser   = require('cookie-parser')
  , cookie         = cookieParser(SECRET)
  , store          = new express.session.MemoryStore()
  , sessOpts       = {secret: SECRET, key: KEY, store: store}
  , session        = require('express-session')
  , session2       = express.session(sessOpts)
  , load           = require('express-load')
  , bodyParser     = require('body-parser')
  , methodOverride = require('method-override')
  , app            = express()
  , error          = require('./middleware/error')
  , server         = require('http').createServer(app)
  , io             = require('socket.io').listen(server);


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(cookie);
app.use(session2);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());
app.use(app.router);
app.use(express.static(__dirname + '/public'));
app.use(error.notFound);
app.use(error.serverError);

// ...stack de configurações do servidor
io.set('authorization', function(data, accept) {
    cookie(data, {}, function(err) {
        var sessionID = data.signedCookies[KEY];
        store.get(sessionID, function(err, session) {
            if (err || !session) {
                accept(null, false);
            } else {
                data.session = session;
                accept(null, true);
            }
        });
    });
});

load('models')
    .then('controllers')
    .then('routes')
    .into(app);
load('sockets')
    .into(io);

// ...app.listen(3000)
server.listen(3000, function(){
  console.log("Ntalk no ar");
});
