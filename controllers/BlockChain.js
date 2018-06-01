const Crypto = require('crypto');
const Transactions = require('./Transaction');
const hexToBinary = require('./util');
const Block = require('../models/Block');
const Wallet = require('./Wallet');

const BlockChain = function() {
	// INIT CHAIN IS ARRAY BLOCKS
	let chain = [];

	let transaction = new Transactions();
	let transactions = [];

	let wallet = new Wallet();

	let genesisTransaction = {
    'txIns': [{ 'signature': '', 'txOutId': '', 'txOutIndex': 0 }],
    'txOuts': [{
            'address': '04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534a',
            'amount': 50
        }],
    'id': 'e655f6a5f26dc9b4cac6e46f52336428287759cf81ef5ff10854f69d68f43fa3'
	};

	let unspentTxOuts = [];

	// INIT BLOCK
	let currentBlock = {};
	let genesisBlock = {};

	// CONST : PROOF OF WORK
	let DIFFICULTY = 5;
	let REQUIRE_PREFIX = '0'.repeat(DIFFICULTY);

	// CONST : TIME 
	let BLOCK_GENERATION_INTERVAL = 10; // 10 MINUITES
	let DIFFICULTY_ADJUSTMENT_INTERVAL = 10; // MAXIMUM IS 10

	function init(){
		genesisBlock = { 
            index: 0
		  , timestamp: 1511818270000
		  , data: [genesisTransaction]
		  , previousHash: "-1"
		  , difficulty: DIFFICULTY
		  , nonce: 0
		};

		genesisBlock = proofOfWork(genesisBlock);
		chain.push(genesisBlock);
		currentBlock = genesisBlock;
		unspentTxOuts = transaction.processTransactions(genesisBlock.data, [], 0);
	}

	function createHash({ timestamp, data, index, previousHash, difficulty,nonce }) {
		return Crypto.createHash('SHA256').update(timestamp+data+index+previousHash+difficulty+nonce).digest('hex');
	}

	function addToChain(block){
		if(checkNewBlockIsValid(block, currentBlock)) {
			const retVal = transaction.processTransactions(block.data, unspentTxOuts, block.index);

			if(retVal === null) {
				return false;
			} else {
				chain.push(block);
				currentBlock = block;
				unspentTxOuts = retVal;
				return true;	
			}
		}
		
		return false;
	}

	function createBlock(data){
		let newBlock = {
		    timestamp: new Date().getTime()
		  , data: data
		  , index: currentBlock.index+1
		  , previousHash: currentBlock.hash
		  // , difficulty: DIFFICULTY
		  , nonce: 0
		};

		newBlock.difficulty = getDifficulty();

		newBlock = proofOfWork(newBlock);

		return newBlock;
	}

	const generateRawNextBlock = (blockData) => {
	    const _difficulty = getDifficulty(getBlocks());

	    const newBlock = proofOfWork({
	    	index: currentBlock.index + 1,
	    	previousHash: currentBlock.hash, 
	    	timestamp: getCurrentTimestamp(),
	    	data: blockData,
	    	difficulty: _difficulty,
	    	nonce: 0
	    });
	    
	    if (addToChain(newBlock)) {
	        // broadcastLatest();
	        return newBlock;
	    } else {
	        return null;
	    }

	};

	const generateNextBlock = () => {
	    const coinbaseTx = transaction.getCoinbaseTransaction(wallet.getPublicFromWallet(), currentBlock.index + 1); // Transaction
	    const blockData = [coinbaseTx]; // : Transaction[]
	    return generateRawNextBlock(blockData);
	};

	const generateNextBlockWithTransaction = (receiverAddress, amount) => {
	    if (!isValidAddress(receiverAddress)) {
	        throw Error('invalid address');
	    }
	    if (typeof amount !== 'number') {
	        throw Error('invalid amount');
	    }
	    const coinbaseTx = transaction.getCoinbaseTransaction(wallet.getPublicFromWallet(), currentBlock.index + 1); // : Transaction
	    const tx = wallet.createTransaction(receiverAddress, amount, wallet.getPrivateFromWallet(), unspentTxOuts); // : Transaction
	    const blockData = [coinbaseTx, tx]; // : Transaction[]
	    return generateRawNextBlock(blockData);
	};

	function proofOfWork(block) {
		while(true){
			block.hash = createHash(block);
			if(block.hash.slice(-block.difficulty) === REQUIRE_PREFIX){	
				return block;
			}else{
				block.nonce++;
			}
		}
	}

	// function findBlock(index, previousHash, timestamp, data, difficulty) {
	//     let nonce = 0;
	//     while (true) {
	//         const hash = createHash(index, previousHash, timestamp, data, difficulty, nonce);
	//         if (hashMatchesDifficulty(hash, difficulty)) {
	//             return new Block(index, hash, previousHash, timestamp, data, difficulty, nonce);
	//         }
	//         nonce++;
	//     }
	// };

	function hasValidHash(block) {
	    if (!hashMatchesBlockContent(block)) {
	        console.log('invalid hash, got:' + block.hash);
	        return false;
	    }

	    if (!hashMatchesDifficulty(block.hash)) {
	        console.log('block difficulty not satisfied. Expected: ' + block.difficulty + 'got: ' + block.hash);
	        return false;
	    }
	    return true;
	};

	function hashMatchesBlockContent(block) {
	    const blockHash = createHash(block);
	    return blockHash === block.hash;
	}

	function hashMatchesDifficulty(hash) {
	    const hashInBinary = hexToBinary(hash);
	    return hashInBinary.startsWith(REQUIRE_PREFIX);
	}

	function getAccumulatedDifficulty(aBlockchain) {
	    return aBlockchain
	        .map((block) => block.difficulty)
	        .map((difficulty) => Math.pow(2, difficulty))
	        .reduce((a, b) => a + b);
	}

	function getBlocks() {
		return chain
	}

	function getLatestBlock() {
		return currentBlock;
	}

	function getTotalBlocks() {
		return chain.length;
	}

	function replaceChain(newChain){
		chain = newChain;
		currentBlock = chain[chain.length-1];
	}

	function checkNewBlockIsValid(block, previousBlock){
		if (previousBlock.index + 1 !== block.index) {
			//Invalid index
			return false;
		} else if (previousBlock.hash !== block.previousHash) {
			//The previous hash is incorrect
			return false;
		} else if(!hashIsValid(block)) {
			//The hash isn't correct
			return false;
		} else if (!isValidationTimestamp(block, previousBlock)) {
			// The time isn't correct
			return false
		}
		
		return true;
	}	

	function hashIsValid(block){
		return (createHash(block) == block.hash);
	}

	function checkNewChainIsValid(newChain){
		//Is the first block the genesis block?
		if(createHash(newChain[0]) !== genesisBlock.hash ){
			return false;
		}

		let previousBlock = newChain[0];
		let blockIndex = 1;

        while(blockIndex < newChain.length){
        	let block = newChain[blockIndex];

        	if(block.previousHash !== createHash(previousBlock)){
        		return false;
        	}

        	if(block.hash.slice(-DIFFICULTY) !== REQUIRE_PREFIX){	
        		return false;
        	}

        	previousBlock = block;
        	blockIndex++;
        }

        return true;
	}

	function getDifficulty() {
		if (currentBlock.index !== 0 && currentBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0) {
			getAdjustmentDifficulty()
		} else {
			return currentBlock.difficulty
		}
	}

	function getAdjustmentDifficulty() {
		const prevAdjustmentBlock = chain[chain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
		const timeExpexted = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
		const timeTaken = currentBlock.timestamp - prevAdjustmentBlock.timestamp;

		if (timeTaken < timeExpexted / 2) {
			return prevAdjustmentBlock.difficulty + 1
		} else if (timeTaken > timeExpexted / 2) {
			return prevAdjustmentBlock.difficulty - 1
		} else {
			return prevAdjustmentBlock.difficulty
		}
	}

	function isValidationTimestamp(newBlock, previousBlock) {
		return newBlock.timestamp - 60 > previousBlock.timestamp && newBlock.timestamp + 60  > getCurrentTimestamp();
	}

	function getCurrentTimestamp() {
		return Math.round(new Date().getTime() / 1000);
	}

	return {
		init,
		createBlock,
		addToChain,
		checkNewBlockIsValid,
		getBlocks,
		getLatestBlock,
		getTotalBlocks,
		checkNewChainIsValid,
		replaceChain,
		generateNextBlock,
		generateRawNextBlock
	};
};

module.exports = BlockChain;