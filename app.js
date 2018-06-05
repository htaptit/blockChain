const Routes = require('./routes/Routes')
const Nodes = require('./controllers/Nodes')
const Wallet = require('./controllers/Wallet');
const TransactionPool = require('./controllers/TransactionPool');
const Transaction = require('./controllers/Transaction');




let transactionPool = new TransactionPool();
let wallet = new Wallet();
let transaction = new Transaction()

const port = 18070 + Math.floor(Math.random() * 30)
console.log('starting node on ', port)

// const httpPort = 3000 + Math.floor(Math.random() * 10)
const httpPort = 3000

let httpServer = new Routes(httpPort, new Nodes(port), new Wallet())
console.log('created httpServer at port ', httpServer.http_port)
