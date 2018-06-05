const Elliptic = require('elliptic');
const fs = require('fs');
const _ = require('lodash');
const Transaction = require('./Transaction');
const TxIn = require('../models/TxIn');
const TxOut = require('../models/TxOut');


const EC = new Elliptic.ec('secp256k1');
const privateKeyLocation = process.env.PRIVATE_KEY || 'node/wallet/private_key';

const Wallet = function() {
	const getPrivateFromWallet = () => {
		const buffer = fs.readFileSync(privateKeyLocation, 'utf8');
		return buffer.toString();
	}

	const getPublicFromWallet = () => {
		const privateKey = getPrivateFromWallet();
		const key = EC.keyFromPrivate(privateKey, 'hex');
		return key.getPublic().encode('hex');
	}

	const generatePrivateKey = () => {
		const keyPair = EC.genKeyPair();
		const privateKey = keyPair.getPrivate();
		return privateKey.toString(16);
	}

	const init = () => {
		if (fs.existsSync(privateKeyLocation)) {
			return;
		}

		const newPrivateKey = generatePrivateKey();

		fs.writeFileSync(privateKeyLocation, newPrivateKey);
		console.log('New wallet with private key created !');
	}

	const getBalance = (address, unspentTxOuts) => {
	    return _(unspentTxOuts)
	        .filter((uTxO) => uTxO.address === address)
	        .map((uTxO) => uTxO.amount)
	        .sum();
	};

	const findUnspentTxOuts = (ownerAddress, unspentTxOuts) => {
		return _.filter(unspentTxOuts, (uTxO) => uTxO.address === ownerAddress);
	}

	const findTxOutsForAmount = (amount, myUnspentTxOuts) => {
	    let currentAmount = 0;
	    const includedUnspentTxOuts = [];
	    for (const myUnspentTxOut of myUnspentTxOuts) {
	        includedUnspentTxOuts.push(myUnspentTxOut);
	        currentAmount = currentAmount + myUnspentTxOut.amount;
	        if (currentAmount >= amount) {
	            const leftOverAmount = currentAmount - amount;
	            return {includedUnspentTxOuts, leftOverAmount};
	        }
	    }

	    const eMsg = "Không thể tạo giao dịch từ các đầu ra giao dịch chưa có sẵn." + " Sô tiền bắt buộc :" + amount + '. Available unspentTxOuts:' + JSON.stringify(myUnspentTxOuts);
	    throw Error(eMsg);
	};

	const filterTxPoolTxs = (unspentTxOuts, transactionPool) => {
		const txIns = _(transactionPool)
			.map(tx => tx.txIns)
			.flatten()
			.value();

			const removable = [];

			for (const unspentTxOut of unspentTxOuts) {
				const txIn = _.find(txIns, aTxIn => {
					return aTxIn.txOutIndex === unspentTxOut.txOutIndex && aTxIn.txOutId === unspentTxOut.txOutId;
				});

				if (txIn === undefined) {

				} else {
					removable.push(unspentTxOut)
				}
			}

			return _.without(unspentTxOuts, ...removable);
	}

	const deleteWallet = () => {
		if (fs.existsSync(privateKeyLocation)) {
			fs.unlinkSync(privateKeyLocation);
		}
	}

	const createTxOuts = (receiverAddress, myAddress, amount, leftOverAmount) => {
	    const txOut1 = new TxOut(receiverAddress, amount);
	    if (leftOverAmount === 0) {
	        return [txOut1];
	    } else {
	        const leftOverTx = new TxOut(myAddress, leftOverAmount);
	        return [txOut1, leftOverTx];
	    }
	};

	const createTransaction = (receiverAddress, amount, privateKey, unspentTxOuts, txPool) => {
		console.log('txPool : %s', JSON.stringify(privateKey));
		const __ = new Transaction();

	    const myAddress = __.getPublicKey(privateKey);
	    const myUnspentTxOutsA = unspentTxOuts.filter(uTxO => uTxO.address === myAddress);

	    const myUnspentTxOuts = filterTxPoolTxs(myUnspentTxOutsA, txPool);

	    const {includedUnspentTxOuts, leftOverAmount} = findTxOutsForAmount(amount, myUnspentTxOuts);

	    const toUnsignedTxIn = (unspentTxOut) => {
	        const txIn = new TxIn();
	        txIn.txOutId = unspentTxOut.txOutId;
	        txIn.txOutIndex = unspentTxOut.txOutIndex;
	        return txIn;
    	};

	    const unsignedTxIns = includedUnspentTxOuts.map(toUnsignedTxIn);

	    const tx = new Transaction();
	    tx.txIns = unsignedTxIns;
	    tx.txOuts = createTxOuts(receiverAddress, myAddress, amount, leftOverAmount);
	    tx.id = __.getTransactionId(tx);

	    tx.txIns = tx.txIns.map((txIn, index) => {
	        txIn.signature = __.signTxIn(tx, index, privateKey, unspentTxOuts);
	        return txIn;
	    });

	    return tx;
	};

	return {
		createTransaction, getPublicFromWallet,
    	getPrivateFromWallet, getBalance, generatePrivateKey, init, deleteWallet, findUnspentTxOuts
	}
}

module.exports = Wallet;