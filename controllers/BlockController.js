"use strict";
// Lib
var SHA256 = require("crypto-js/sha256");

// Controller 
var BlockChainController = require('./BlockChainController');

// Model
var Block = require("../models/Block");
var Data = require("../models/Data");

// class 
module.exports = class BlockController {
	calculateHash(index, previousHash, timeStamp, data) {
		return SHA256(index + previousHash + timeStamp + data).toString();
	}

	getTimeNow() {
		return Date.now();
	}

	genesisBlock() {
		var initData = new Data(0, 'Hoang Trong Anh', 10);
		var hash = this.calculateHash(0, 0, this.getTimeNow(), initData);
		return new Block(0, hash, 0, this.getTimeNow(), initData);
	}
}