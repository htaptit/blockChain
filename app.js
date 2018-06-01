const Routes = require('./routes/Routes')
const Nodes = require('./controllers/Nodes')
const Wallet = require('./controllers/Wallet');


const wl = new Wallet();
wl.initWallet();

const port = 18070 + Math.floor(Math.random() * 30)
console.log('starting node on ', port)

const httpPort = 3000 + Math.floor(Math.random() * 10)

let httpServer = new Routes(httpPort, new Nodes(port))
console.log('created httpServer at port ', httpServer.http_port)
