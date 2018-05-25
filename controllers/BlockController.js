"use strict";
// Lib
var SHA256 = require("crypto-js/sha256");
var validator = require("validator");
// Controller 
var BlockChainController = require('./BlockChainController');

// Model
var Block = require("../models/Block");
var Data = require("../models/Data");

// class 
module.exports = class BlockController {
	calculateHash(index, previousHash, timeStamp, data) {
		return SHA256(index + previousHash + timeStamp + JSON.stringify(data)).toString();
	}

	getTimeNow() {
		return Date.now();
	}

	genesisBlock() {
		var initData = new Data(0, 'Hoang Trong Anh', 10);
		var hash = this.calculateHash(0, 0, 1511818270000, initData);
		return new Block(0, hash, 0, 1511818270000, initData);
	}

	isValidBlockStructure(block) {
		if (block) {
			return typeof block.index === 'number'
				&& validator.isHash(block.hash, 'sha256') 
				&& typeof block.previousHash === 'string'
				&& typeof block.timeStamp === 'number'
				&& typeof block.data === 'object'
		}

		return false
	}
}