'use strict';

module.exports = function(app) {
	const _ = require('../controllers/PeerToPeerWebSocket');
	const p2p = new _();

	app.get('/peers', (req, res) => {
		var sockets = p2p.getSockets();
		res.send(sockets.map((s) => s._socket.remoteAddress + ':' + s._socket.remotePort));
	});

	app.post('/addPeer', (req, res) => {
		p2p.connectToPeer(req.body.peer);
		res.send();
	});
}