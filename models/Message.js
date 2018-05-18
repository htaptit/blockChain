'use strict';

module.exports = class Message {
	constructor(type, data) {
		this.type = type;
		this.data = data;
	}
}