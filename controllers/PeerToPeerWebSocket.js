'use strict';

// const Message = require('../models/Message');

const BlockChainController = require('./BlockChainController');
const WebSocket = require('ws');

module.exports.MessageType = {
	QUERY_LATEST : 0,
	QUERY_ALL : 1,
	RESPONSE_BLOCKCHAIN : 2
}

module.exports = class P2P {
	constructor() {
		this.sockets = [];
	}

	initP2PServer(p2pPort) {
		const server = new WebSocket.Server({ port : p2pPort});
		server.on('connection', (ws) => {

		});
	}

	initConnection(webSocket) {
		// them peer moi
		this.sockets.push(webSocket);
		this.initMessageHandler(webSocket);
		this.initErrorHandler(webSocket);
		write(webSocket, queryChainLengthMsg());

	}

	write(webSocket, message) {
		webSocket.send(JSON.stringify(message));
	}

	initMessageHandler(webSocket) {
		webSocket.on('message', (data) => {
			var message = this.jsonToMessageStuctor(data);

			if (message === null) {
				console.error('Could not parse received JSON message : ' + data);
				return;
			}

			console.log('Received message : ' + JSON.stringify(message));

			switch (message.type) {
				case MessageType.QUERY_LATEST: 

					break;
				case MessgeType.QUERY_ALL:

					break;
				case MessageType.RESPONSE_BLOCKCHAIN:

					break;
			}
		});
	}

	initErrorHandler(webSocket) {

	}

	jsonToMessageStuctor(dataJson) {
		try {
			return JSON.parse(dataJson);
		} catch(e) {
			console.error('Error parse : ' + e);
			return null;
		}
	}

	responseLastestMsg() {
		// return {'type' : MessageType.RESPONSE_BLOCKCHAIN, 'data' : };
	}


}