'use strict';

const BlockChainController = require('./BlockChainController');
const BlockController = require('./BlockController');

const WebSocket = require('ws');
const { Message, MessageType } = require('../models/Message');

module.exports = class P2P {
	constructor() {
		this.sockets = [];
		this.MessageType = new MessageType();
		this.Message = new Message();
		this.blockChainController = new BlockChainController();
		this.blockController = new BlockController();
	}

	init() {
		
	}

	initP2PServer(p2pPort) {
		const server = new WebSocket.Server({ port : p2pPort});
		server.on('connection', (ws) => {
			this.initConnection(ws);
		});
		console.log('listening websocket p2p port on: ' + p2pPort);
	}

	initConnection(webSocket) {
		// them peer moi
		this.sockets.push(webSocket);
		this.initMessageHandler(webSocket);
		this.initErrorHandler(webSocket);
		this.write(webSocket, this.queryLastestMsg());
	}

	getSockets() {
		return this.sockets;
	}

	write(webSocket, message) {
		webSocket.send(JSON.stringify(message));
	}

	broadCast(message) {
		this.sockets.forEach(socket => this.write(socket, message));
	}

	broadCastLatest() {
		this.broadCast(this.responseLastestMsg());
	}

	queryLastestMsg() {
		return new Message(this.MessageType.QUERY_LATEST, null);
	}

	queryAllMsg() {
		return new Message(this.MessageType.QUERY_ALL, null);
	}

	responseLastestMsg() {
		return new Message( this.MessageType.RESPONSE_BLOCKCHAIN, JSON.stringify( [this.blockChainController.getLastestBlock()] ) );
	}

	responseChainMsg() {
		return new Message(this.MessageType.RESPONSE_BLOCKCHAIN, JSON.stringify(this.blockChainController.getAllBlocks()));
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
				case this.MessageType.QUERY_LATEST: 
					this.write(webSocket, this.responseLastestMsg());
					break;
				case this.MessageType.QUERY_ALL:
					this.write(webSocket, this.responseChainMsg())
					break;
				case this.MessageType.RESPONSE_BLOCKCHAIN:
					const receviedBlocks = this.jsonToBlockArrayStructor(message.data);

					if (receviedBlocks === null) {
						console.log("data, ...args");
						break;
					}
// console.log(receviedBlocks);
					this.handleBlockchainResponse(receviedBlocks);
					
					break;
			}
		});
	}

	handleBlockchainResponse(receviedBlocks) {
		if (receviedBlocks.length === 0) {
			return;
		}

		const lastestBlockReceived = receviedBlocks[receviedBlocks.length - 1];

		if (!this.blockController.isValidBlockStructure(lastestBlockReceived)) {
			return;
		}

		const lastestBlockHeld = this.blockChainController.getLastestBlock();

		if (lastestBlockReceived.index > lastestBlockHeld.index) {
			if (lastestBlockReceived.previousHash === lastestBlockHeld.hash) {
				if (this.addBlockToChain(lastestBlockReceived)) {
					this.broadCast(this.responseLastestMsg());
				}
			} else if (receviedBlocks.length === 1) { // receviedBlocks la cai cuoi cung trong chain.
				this.broadCast(this.queryAllMsg());
			} else {
				this.replaceChain(receviedBlocks);
			}
		} else {
			console.log(' <=> . Do nothing !');
		}

	}

	addBlockToChain(newBlock) {
		if (this.blockChainController.isValidNewBlock(newBlock, this.blockChainController.getLastestBlock())) {
			this.blockChainController.addNewBlockToChain(newBlock);
			this.broadCastLatest();
			return true
		}
		return false;
	}

	createNewBlock(data) {
		var _ = this
		this.blockChainController.addNewBlock(data, function(res) {
			_.broadCastLatest();
		});
	}

	replaceChain(newChain) {
		if (this.blockChainController.isVaildChain(newChain) && newChain.blocks.length > this.blockChainController.getAllBlocks().length) {
			this.blockChainController.blockChain = newChain;
			this.broadCastLatest();
		}
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

	connectToPeer(newPeer) {
		const ws = new WebSocket(newPeer);

		ws.on('open', () => {
			this.initConnection(ws);
		});

		ws.on('error', (err) => {
			console.error(err);
		});
	}
}


