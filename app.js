const createError = require('http-errors')
const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const session = require('express-session')
const morgan = require('morgan')
const logger = require('./helpers/logger')
const auth = require('./config/auth.json')
const TwigRender = require('./helpers/twigRender')
const RedisStore = require('connect-redis')(session)
const cors = require('cors')
const fileUpload = require('express-fileupload')
const socketServer = require('./config/socketServerSingleton')
const fs = require('fs')

const HTTP_PORT = 80
const HTTPS_PORT = 443

const app = express()
let server
if (auth.protocol === 'http') {
    server = require('http').createServer(app)
} else if (auth.protocol === 'https') {
    server = require('https').createServer({
        key: fs.readFileSync(auth.ssl.key, 'utf8'),
        cert: fs.readFileSync(auth.ssl.cert, 'utf8'),
        ca: auth.ssl.chain ? fs.readFileSync(auth.ssl.chain, 'utf8') : null
    }, app)

    // force https
    let httpApp = express()
    httpApp.use(function(req, res, next) {
        if(!req.secure) {
            return res.redirect(['https://', req.get('Host'), req.url].join(''));
        }
        next();
    })
    let httpServer = require('http').createServer(httpApp)
    httpServer.listen(HTTP_PORT)
} else {
    throw new Error("Invalid protocol")
}

socketServer(app, server)

// override environment variables from auth
process.env.NODE_ENV = auth.environment

// some requests were being sent back with a 304 (cached response), but this often contained expired session
// and react was then updating the new & correct session with the old and expired one.
// So we turn that cache thing off entirely.
app.set('etag', false)

app.use(function(req, res, next) {
    // make sure our node environment matches our auth environment
    req.app.set('env', auth.environment)

    // make some configurations available to the view
    res.locals.site = {
        environment: auth.environment,
        static: auth.static.resource
    }

    // disable cache
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')

    return next()
})

// build our session conf object
const sessionData = {
    secret: auth.session.secret,
    store: new RedisStore({
        host: auth.redis.host,
        port: auth.redis.port,
    }),
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: auth.session.age
    }
}

if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sessionData.cookie.secure = true // serve secure cookies
}
// set up session support
app.use(cors({
    credentials: true,
    origin: auth.domain,
    methods:['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(session(sessionData));
app.use(function (req, res, next) {
    if (!req.session) {
        return next(createError(500, "Could not start a session"))
    }
    next() // otherwise continue
})

// configure our body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// configure our favicon
app.use(favicon(path.join(__dirname, 'assets', 'favicon.ico')))

// configure our file upload helper
app.use(fileUpload({
    useTempFiles : true,
    createParentPath: true,
    tempFileDir : path.join(__dirname, 'temp', 'upload'),
    parseNested: true,
    abortOnLimit: true,
    // 10 MB max file size
    limits: { fileSize: 10 * 1024 * 1024 },
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

if (auth.server) {
    // set our server header
    app.use(function(req, res, next) {
        res.setHeader('Server-Name', auth.server)
        next();
    })
}

/** @see https://www.npmjs.com/package/morgan */
app.use(morgan('tiny', { stream: logger.stream }))

app.use(auth.static.route, express.static(path.join(__dirname, 'assets')));

// load our controllers -- this replaces the idea of routes for a more familiar MVC style
app.use(require('./routes'))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    return next(createError(404));
})

// error handler
app.use(function(err, req, res, next) {
    if (err && (!err.status || err.status >= 500)) {
        // if this is an error we want to log
        logger.error(err)
    }

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);

    if (req._respondsWithJSON) {
        res.json({
            message: err.message
        })
    } else {
        if (err.status === 401) {
            res.redirect('/login')
        } else {
            TwigRender(res, 'error')
        }
    }
})

// just in case?
process.on('uncaughtException', (err) => {
    logger.error(err)
})

server.listen(auth.protocol === 'https' ? HTTPS_PORT : HTTP_PORT)

module.exports = app;
