'use strict';

var express = require('express'),
	app = express(),
	port = process.env.PORT || 3000,
	ip = require('ip'),
	bodyParser = require('body-parser'),
	p2p = require('./controllers/PeerToPeerWebSocket');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var routesChain = require('./routes/BlockChainRoutes');
var routeP2P = require('./routes/P2PRoutes');

routesChain(app);
routeP2P(app);

var _ = new p2p();
_.initP2PServer(6000);

app.listen((ip, port), () => {
	console.log("======= Server listening : " + ip.address() + ":" + port + " =======");
});