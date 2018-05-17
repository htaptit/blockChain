'use strict';

// CURL : https://gist.github.com/subfuzion/08c5d85437d5d4f00e58

module.exports = function(app) {
	var BlockChainController = require('../controllers/BlockChainController');

	var _ = new BlockChainController();

	app.get('/blocks', (req, res) =>  {
		res.send(_.getAllBlocks());
	});

	app.post('/addNewBlock', (req, res) => {
		res.send(_.addNewBlock(req.query));
	});
}