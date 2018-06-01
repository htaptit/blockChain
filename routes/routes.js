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
  constructor (port, node) {
    this.http_port = port
    this._node = node
    this.app = new Express()

    this.app.use(BodyParser.json())

    this._node.init()

    // GET
    this.app.get('/blocks', (req, res) => {
      res.send(this._node.getBlocks());
    });


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


    this.app.listen(this.http_port, () => {
      console.log('http server up')
    })
  }
}

module.exports = Routes