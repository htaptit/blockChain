"use strict";
var BlockChain = require('../models/BlockChain');
var BlockController = require('./BlockController');
var Block = require("../models/Block");
var parserData = require("../parsers/ParserURLToData"); 

module.exports = class BlockChainController {
	constructor() {
		this.blockChain = new BlockChain();
		this.blockCtr = new BlockController();
		this.blockChain.blocks.push(this.blockCtr.genesisBlock());
	}

	addNewBlock(blockDataRaw, callback) {
		var blockData = parserData.paramsToData(blockDataRaw);

		if (blockData) {
			var newBlock = this.generateNextBlock(blockData)
			this.addNewBlockToChain(newBlock);
			callback({ status: true, new_block: newBlock });
		}

		callback({ status: false, new_block: null });
	}

	addNewBlockToChain(newBlock) {
		this.blockChain.blocks.push(newBlock);
	}
	
	getAllBlocks() {
		return this.blockChain.blocks;
	}

	getLastestBlock() {
		return this.blockChain.blocks[this.blockChain.blocks.length - 1];
	}

	generateNextBlock(nextBlockData) {
		var previousBlock = this.getLastestBlock();

		var nextIndex = previousBlock.index + 1;
		var nextTimeStamp = this.blockCtr.getTimeNow();
		var newHash = this.blockCtr.calculateHash(nextIndex, previousBlock.hash, nextTimeStamp, JSON.stringify(nextBlockData));
		var newBlock = new Block(nextIndex, newHash, previousBlock.hash, nextTimeStamp, nextBlockData);

		return newBlock;
	}

	isValidNewBlock(newBlock, lastestBlock) {
		if (newBlock.index - 1 !== lastestBlock.index) {
			console.error('invalid index');
			return false;
		} else if (lastestBlock.hash !== newBlock.previousHash) {
			console.error('invalid hash');
			return false
		} else if (this.blockCtr.calculateHash(newBlock.index, newBlock.previousHash, newBlock.timeStamp, JSON.stringify(newBlock.data)) !== newBlock.hash) {
			console.error('invalid hash : typeOf hash #');
			return false;
		}

		return true;
	}


	// blockChainToValid = BlockChain
	isVaildChain(blockChainToValid) {
		function isValidGenesis(block) {
			return JSON.stringify(block) === JSON.stringify(this.blockCtr.genesisBlock())
		};

		if (!isValidGenesis(blockChainToValid.blocks[0])) {
			return false;
		}

		for (i = 1; i < blockChainToValid.blocks.length; i++) {
			if (!isValidNewBlock(blockChainToValid[i]), blockChainToValid[i - 1]) {
				return false;
			}
		}

		return true;
	}
}