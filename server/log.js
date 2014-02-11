var winston = require('winston'),
	fs = require('fs');

var logDirectory = __dirname + '/../logs';

if (!fs.existsSync(logDirectory)) {
	fs.mkdirSync(logDirectory);
}

module.exports = new(winston.Logger)({
	transports: [
		new(winston.transports.Console)({
			json: false,
			timestamp: true,
			level: 'debug',
			colorize: true,
			prettyPrint: true
		}),
		new winston.transports.File({
			filename: logDirectory + '/debug.log',
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
			filename: logDirectory + '/exceptions.log',
			json: false,
			handleExceptions: true,
			prettyPrint: true
		})
	],
	exitOnError: false
});