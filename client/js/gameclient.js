define(['lib/socket.io', 'lib/bison'], function (io, BISON) {
	var GameClient = Class.extend({
		init: function (host, port) {
			this.connection = null;
			this.host = host;
			this.port = port;
		},
		connect: function () {
			this.connection = io.connect("http://" + this.host, {
				transports: ["websocket"]
			});
			this.connection.on('message', this.decodeMessage);
			this.callbacks = {};
			this.callbacks[Constants.Types.Messages.Welcome] = this.welcome_callback;
			this.callbacks[Constants.Types.Messages.Map] =  this.map_callback;
			this.callbacks[Constants.Types.Messages.EntityList] =  this.entity_list_callback;
		},
		decodeMessage: function (event) {
			// Normally you'd expect that event.data is a string, but in
			// binary transfer u get a write-protected Blob of data
			// which can be read as a stream.

			var reader = new FileReader();

			// There is also readAsBinaryString method if you are not using typed arrays
			reader.readAsArrayBuffer(event.data);

			// As the stream finish to load we can use the results
			reader.onloadend = function () {

				// Another tricky part. Before you can read the results you have to create
				// a view for our typed array
				var view = new Uint8Array(this.result);

				// Now let's decode array containing char indexes to normal ol' utf8 string
				var str = "";
				for (var i = 0; i < view.length; i++) {
					str += String.fromCharCode(view[i]);
				}

				// Our string is still BISON encoded, so last conversion needs to be done.
				var message = BISON.decode(str);

				// Voilà, here comes object that we sent
				console.log(message);

				this.callbacks[message.t](message.d);
			};
		},
		onEntityList: function (callback) {
			this.entity_list_callback = callback;
		},
		onWelcome: function (callback) {
			this.welcome_callback = callback;
		},
		onMap: function (callback) {
			this.map_callback = callback;
		},
		action: function (action) {
			this.connection.emit('action', action);
		},
		angle: function (angle) {
			this.connection.emit('angle', angle);
		}
	});
	return GameClient;
});