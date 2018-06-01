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


    this.app.listen(this.http_port, () => {
      console.log('http server up')
    })
  }
}

module.exports = Routes