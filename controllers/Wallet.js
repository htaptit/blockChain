const Elliptic = require('elliptic');
const fs = require('fs');
const _ = require('lodash');
const Transaction = require('./Transaction');

const EC = new Elliptic.ec('secp256k1');
const privateKeyLocation = 'node/wallet/private_key';

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

	const initWallet = () => {
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
	    throw Error('not enough coins to send transaction');
	};

	const createTxOuts = (receiverAddress, myAddress, amount, leftOverAmount) => {
	    const txOut1 = new TxOut(receiverAddress, amount);
	    if (leftOverAmount === 0) {
	        return [txOut1];
	    } else {
	        const leftOverTx = new TxOut(myAddress, leftOverAmount);
	        return [txOut1, leftOverTx];
	    }
	};

	const createTransaction = (receiverAddress, amount, privateKey, unspentTxOuts) => {
	    const myAddress = getPublicKey(privateKey);
	    const myUnspentTxOuts = unspentTxOuts.filter((uTxO) => uTxO.address === myAddress);

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
	    tx.id = getTransactionId(tx);

	    tx.txIns = tx.txIns.map((txIn, index) => {
	        txIn.signature = signTxIn(tx, index, privateKey, unspentTxOuts);
	        return txIn;
	    });

	    return tx;
	};

	return {
		createTransaction, getPublicFromWallet,
    	getPrivateFromWallet, getBalance, generatePrivateKey, initWallet
	}
}

module.exports = Wallet;