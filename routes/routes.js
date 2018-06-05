const Express = require('express')
const BodyParser = require('body-parser')

/**
 * Class Routes: creates the route management web server with express
 */
class Routes {
  /**
   * Creates an instance of a listening server
   * @param port
   * @param node
   */
  constructor (port, node, wallet, transaction , transactionPool) {
    this.http_port = port

    this._node = node
    this._wallet = wallet
    this._pool = transactionPool

    this.app = new Express()

    this.app.use(BodyParser.json())

    this._node.init()
    this._wallet.init()

    // GET
    this.app.get('/blocks', (req, res) => {
      res.send(this._node.getBlocks());
    });

    this.app.get('/unspentTransactionOutputs', (req, res) => {
      res.send(this._node.getUnspentTxOuts());
    });

    this.app.get('/myUnspentTransactionOutputs', (req, res) => {
      res.send(this._node.getMyUnspentTransactionOutputs());
    });

    this.app.get('/balance', (req, res) => {
        const balance = this._node.getAccountBalance();
        res.send({'balance': balance});
    });

    this.app.get('/address', (req, res) => {
        const address = wallet.getPublicFromWallet();
        res.send({'address': address});
    });

    // END GET 


    // POST 
    this.app.post('/addNode', (req, res) => {
      console.log('add host: ' + req.query.port)
      node.addPeer('localhost', req.query.port)
      res.send()
    })

    this.app.post('/createBlock', (req, res) => {
      node.createBlock(req.params.data)
      console.log('block created')
      res.send()
    })

    this.app.post('/mineRawBlock', (req, res) => {
        if (req.body.data == null) {
            res.send('data parameter is missing');
            return;
        }
        const newBlock = generateRawNextBlock(req.body.data);
        if (newBlock === null) {
            res.status(400).send('could not generate block');
        } else {
            res.send(newBlock);
        }
    });

    this.app.post('/mineBlock', (req, res) => {
        const newBlock = this._node.mineBlock();
        if (newBlock === null) {
            res.status(400).send('could not generate block');
        } else {
            res.send(newBlock);
        }
    });

    this.app.post('/mineTransaction', (req, res) => {
        const address = req.query.address; // 0445d9c3c0ab0c620b7f91c9649500a472b3a6df3c66ac3a3fef35b52f6d114b4b391695f16ae7ee55bd69bc35faf14abab733eaeefe4f9147b3f731ae12d360ae
        const amount = parseInt(req.query.amount); // 50

        try {
            const resp = this._node.generateNextBlockWithTransaction(address, amount);
            res.send(resp);
        } catch (e) {
            console.log("Error: %s", e.message);
            res.status(400).send(e.message);
        }
    });

    this.app.post('/sendTransaction', (req, res) => {
        try {
            const address = req.query.address;
            const amount = parseInt(req.query.amount);

            if (address === undefined || amount === undefined) {
                throw Error('invalid address or amount');
            }
            const resp = this._node.sendTransaction(address, amount);
            res.send(resp);
        } catch (e) {
            console.log(e.message);
            res.status(400).send(e.message);
        }
    });

    this.app.get('/transactionPool', (req, res) => {
        res.send(this._pool.getTransactionPool());
    });


    this.app.listen(this.http_port, () => {
      console.log('http server up')
    })
  }
}

module.exports = Routes