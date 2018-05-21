"use strict";

module.exports = class Block {
	constructor(index, hash, previousHash, timeStamp, data) {
		this.index = index;
		this.hash = hash.toString();
		this.previousHash = previousHash.toString();
		this.timeStamp = timeStamp;
		this.data = data;
	}
}
