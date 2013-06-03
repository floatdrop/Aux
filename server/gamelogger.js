var fs = require('fs');

var GameLogger = Class.extend({
	MsgType: {
		Action: 0,
		Connect: 1,
		Disconnect: 2
	},
	initialize: function () {
		this.updateDate();
	},
	updateDate: function () {
		var self = this;
		this.startTime = new Date();
		this.oldCommandTime = this.startTime.getTime();
		this.path = config.server.replaysPath + "/" + "replay-" + this.startTime.toISOString().split(':').join('-');
		if (this.file) {
			fs.close(this.file);
		}
		fs.open(this.path, 'w', function (err, fd) {
			if (err) {
				log.error("Error, while opening " + self.path + ":" + err);
			} else {
				self.file = fd;
			}
		});
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

		fs.write(this.file, buf, 0, buf.length);
	}
});

module.exports = new GameLogger();