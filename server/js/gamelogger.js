var cls = require("./lib/class"),
	fs = require('fs');

var GameLogger = cls.Class.extend({
	MsgType: {
		Action: 0,
		Connect: 1,
		Disconnect: 2
	},
	init: function () {
		this.startTime = new Date();
		this.oldCommandTime = this.startTime.getTime();
		this.path = __dirname + "/../../client/replays/" + this.startTime.toString().split(':').join('-');
	},

	write: function (connection, binaryMsg, msgtype) {
		var id = new Buffer(connection.id),
			buf = new Buffer(13 + id.length + binaryMsg.length),
			curTimeMs = new Date().getTime(),
			time = curTimeMs - this.oldCommandTime;
		
		this.oldCommandTime = curTimeMs;

		buf[0] = msgtype;
		buf.writeUInt32BE(time, 1);
		buf.writeUInt32BE(id.length, 5);
		buf.writeUInt32BE(binaryMsg.length, 9);
		id.copy(buf, 13);
		binaryMsg.copy(buf, 13 + id.length);

		fs.appendFile(this.path, buf, function (err) {
			if (err) throw err;
		});
	}
});

module.exports = new GameLogger();