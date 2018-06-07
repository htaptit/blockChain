const ip = require('ip');

const Routes = require('./routes/Routes')
const Nodes = require('./controllers/Nodes')
const Wallet = require('./controllers/Wallet');
const TransactionPool = require('./controllers/TransactionPool');
const Transaction = require('./controllers/Transaction');

let transaction = new Transaction();
let transactionPool = new TransactionPool();
let wallet = new Wallet(transaction);

const port = 18070 + Math.floor(Math.random() * 30)
console.log('Starting node on ', port)

const httpPort = 3000 + Math.floor(Math.random() * 10)
// const httpPort = 3000

let httpServer = new Routes(httpPort, new Nodes(port, transaction, transactionPool, wallet), wallet, transaction, transactionPool)
console.log('Created server %s:%s', ip.address(), httpServer.http_port)
