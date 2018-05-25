'use strict';

module.exports = function(app) {
	const p2p = require('../controllers/PeerToPeerWebSocket');
	const __ = new p2p();

	var chain = require('../controllers/BlockChainController');
	var _ = new chain();

	app.get('/blocks', (req, res) =>  {
		res.send(__.blockChainController.blockChain.blocks);
	});

	app.post('/addNewBlock', (req, res) => {
		res.send(__.createNewBlock(req.query));
	});

	app.get('/peers', (req, res) => {
		var sockets = __.getSockets();
		res.send(sockets.map((s) => s._socket.remoteAddress + ':' + s._socket.remotePort));
	});

	app.post('/addPeer', (req, res) => {
		__.connectToPeer(req.body.peer);
		res.send();
	});
}