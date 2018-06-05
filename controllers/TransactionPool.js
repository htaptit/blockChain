const _ = require('lodash');
const Transaction = require('./Transaction');

const TransactionPool = function() {
	let transactionPool = [];

	let transaction = new Transaction();

	const getTransactionPool = () => {
		return _.cloneDeep(transactionPool)
	};

	const addToTransactionPool = (tx, unspentTxOuts) => {
		if (!transaction.validateTransaction(tx, unspentTxOuts)) {
			throw Error('Cố gắng bổ sung các tx không hợp lệ vào pool ');
		}

		if (!isValidTxForPool(tx, transactionPool)) {
			throw Error('Cố gắng bổ sung các tx không hợp lệ vào hồ bơi ');
		}

		console.log('adding to txPool: %s', JSON.stringify(tx));
		transactionPool.push(tx);
	};

	const hasTxIn = (txIn, unspentTxOuts) => {
		const foundTxIn = unspentTxOuts.find(uTxO => {
			return uTxO.txOutId === txIn.txOutId && uTxO.txOutIndex === txIn.txOutIndex;
		});

		return foundTxIn !== undefined;
	};

	const updateTransactionPool = (unspentTxOuts) => {
		const invalidTxs = [];

		for(const tx of transactionPool) {
			for (const txIn of tx.txIns) {
				if (!hasTxIn(txIn, unspentTxOuts)) {
					invalidTxs.push(tx);
					break;
				}
			}
		}

		if (invalidTxs.length > 0) {
			console.log("Xóa các giao dịch sau khỏi txPool: %s", JSON.stringify(invalidTxs));
			transactionPool = _.without(transactionPool, ...invalidTxs);
		}
	}

	const getTxPoolIns = (aTransactionPool) => {
		return _(aTransactionPool)
			.map(tx => tx.txIns)
			.flatten()
			.value();
	}

	const isValidTxForPool = (tx, aTransactionPool) => {
		const txPoolIns = getTxPoolIns(aTransactionPool);

		const containsTxIn = (txIns, txIn) => {
			return _.find(txPoolIns, (txPoolIn) => {
				return txIn.txOutIndex === txPoolIn.txOutIndex && txIn.txOutId === txPoolIn.txOutId;
			});
		};

		for (const txIn of tx.txIns) {
			if (containsTxIn(txPoolIns, txIn)) {
				console.log("txIn đã được tìm thấy trong txPool");
				return false;
			}
		}

		return true
	}

	return {
		addToTransactionPool, getTransactionPool, updateTransactionPool
	}
}

module.exports = TransactionPool;