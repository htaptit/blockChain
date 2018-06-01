'use strict';

class Message {
	constructor(type, data) {
		this.type = type;
		this.data = data;
	}
};

class MessageType {
	constructor() {
		this.QUERY_LATEST = 0;
		this.QUERY_ALL = 1;
		this.RESPONSE_BLOCKCHAIN = 2;
	}
};

module.exports = {
	Message,
	MessageType
}