'use strict';

// const Message = require('../models/Message');

const BlockChainController = require('./BlockChainController');
const WebSocket = require('ws');
const Message = require('../models/Message');

module.exports.MessageType = {
	QUERY_LATEST : 0,
	QUERY_ALL : 1,
	RESPONSE_BLOCKCHAIN : 2
}

module.exports = class P2P {
	constructor() {
		this.sockets = [];
		this.blockChainController = BlockChainController();
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

	broadCast(message) {
		this.sockets.forEach(socket => this.write(socket, message));
	}

	queryLastestMsg() {
		return new Message(MessageType.QUERY_LATEST, null);
	}

	queryAllMsg() {
		return new Message(MessageType.QUERY_ALL, null);
	}

	responseLastestMsg() {
		return new Message( MessageType.RESPONSE_BLOCKCHAIN, JSON.stringify( [this.blockChainController.getLastestBlock()] ) );
	}

	responseChainMsg() {
		return new Message(MessageType.RESPONSE_BLOCKCHAIN, JSON.stringify(this.blockChainController.getAllBlocks()));
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
					this.write(webSocket, this.responseLastestMsg());
					break;
				case MessgeType.QUERY_ALL:
					this.write(webSocket, this.responseChainMsg())
					break;
				case MessageType.RESPONSE_BLOCKCHAIN:
					const receviedBlocks = this.jsonToBlockArrayStructor(message.data);

					if (receviedBlocks === null) {

					}
					
					break;
			}
		});
	}

	initErrorHandler(webSocket) {
		webSocket.on('close', () => this.closeConnection(webSocket));
		webSocket.on('error', () => this.closeConnection(webSocket));
	}

	closeConnection(webSocket) {
		console.log('connection faild to peer : ' + webSocket.url);
		this.sockets.splice(this.sockets.indexOf(webSocket), 1);
	}

	jsonToBlockArrayStructor(dataJson) {
		try {
			return JSON.parse(dataJson);
		} catch(e) {
			console.error('Error Parse : ' + e);
			return null
		}
	}

	jsonToMessageStuctor(dataJson) {
		try {
			return JSON.parse(dataJson);
		} catch(e) {
			console.error('Error parse : ' + e);
			return null;
		}
	}
}