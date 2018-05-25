'use strict';

var express = require('express'),
	app = express(),
	port = process.env.PORT || 3000 + Math.floor( Math.random() * 10 ),
	ip = require('ip'),
	bodyParser = require('body-parser'),
	p2p = require('./controllers/PeerToPeerWebSocket'),
	_port = 6000 + Math.floor( Math.random() * 10 );


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var routes = require('./routes/routes');

routes(app);

var _ = new p2p();
// _.init();
_.initP2PServer(_port);

app.listen((ip, port), () => {
	console.log("======= Server listening : " + ip.address() + ":" + port + " =======");
});