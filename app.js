const createError = require('http-errors')
const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const session = require('express-session')
const morgan = require('morgan')
const logger = require('./helpers/logger')
const auth = require('./config/auth')
const TwigRender = require('./helpers/twigRender')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const socketServer = require('./config/socketServerSingleton')

const app = express()
const server = require('http').createServer(app)

socketServer(app, server)

// override environment variables from auth
process.env.FFMPEG_PATH = auth.ffmpeg
process.env.NODE_ENV = auth.environment

// make sure our node environment matches our auth environment
app.use(function(req, res, next) {
    req.app.set('env', auth.environment)

    // make some configurations available to the view
    res.locals.site = {
        environment: auth.environment,
        static: auth.static.resource
    };

    return next()
})

// build our session conf object
const sessionData = {
    secret: auth.session.secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: auth.session.age || 86400000 // one day by default
    }
}

if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sessionData.cookie.secure = true // serve secure cookies
}
// set up session support
app.use(cors({
    credentials: true,
    origin: auth.domain + ':' + auth.port,
    methods:['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(session(sessionData));

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

/** @see https://www.npmjs.com/package/morgan */
app.use(morgan('tiny', { stream: logger.stream }))

app.use(auth.static.route, express.static(path.join(__dirname, 'assets')));

// load our controllers -- this replaces the idea of routes for a more familiar MVC style
app.use(require('./controllers'))

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

server.listen(auth.port)

module.exports = app;
