var winston = require('winston');

var logger = new(winston.Logger)({
	transports: [
		new(winston.transports.Console)({
			json: false,
			timestamp: true,
			level: 'debug',
			colorize: true,
			prettyPrint: true,
		}),
		new winston.transports.File({
			filename: __dirname + '/debug.log',
			json: false,
			prettyPrint: true
		})
	],
	exceptionHandlers: [
		new(winston.transports.Console)({
			json: false,
			timestamp: true,
			colorize: true,
			prettyPrint: true
		}),
		new winston.transports.File({
			filename: __dirname + '/exceptions.log',
			json: false,
			handleExceptions: true,
			prettyPrint: true
		})
	],
	exitOnError: false
});

module.exports = logger;