const winston = require('winston')
const path = require('path')

const errorStackFormat = winston.format(info => {
    if (info instanceof Error) {
        return Object.assign({}, info, {
            stack: info.stack,
            message: info.message
        })
    }
    return info
})

const errorLogFormat = winston.format.combine(
    winston.format.timestamp(),
    errorStackFormat(),
    winston.format.printf(({ level, message, timestamp, stack }) => {
        return `${timestamp} ${level}: ${message}  --  ${stack}`;
    })
)

const outputLogger = new winston.createLogger({
    format: errorLogFormat,
    transports: [
        new winston.transports.File({
            filename: path.join(__dirname, '..', 'temp', 'log', 'access.log'),
            level: 'info',
            handleExceptions: false,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '..', 'temp', 'log', 'error.log'),
            level: 'error',
            handleExceptions: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
        }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            colorize: true
        })
    ],
    exitOnError: false
})

module.exports = outputLogger;
module.exports.stream = {
    write: function(message, encoding){
        outputLogger.info(message);
    }
}