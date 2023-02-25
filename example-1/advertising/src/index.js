import express from 'express'
import { MongoClient } from 'mongodb'
import bodyParser from 'body-parser'

if (!process.env.DBHOST) {
  throw new Error(
    'Please specify the databse host using environment variable DBHOST.'
  )
}

if (!process.env.DBNAME) {
  throw new Error(
    'Please specify the name of the database using environment variable DBNAME'
  )
}

if (!process.env.PORT) {
  throw new Error(
    'Please specify the port for this microservice using environment variable PORT'
  )
}

const DBHOST = process.env.DBHOST
const DBNAME = process.env.DBNAME
const PORT = process.env.PORT

const setupHandlers = (app, dbClient) => {
  app.get('/product', async (req, res) => {
    const productsCollection = await dbClient.collection('products')
    const product = await productsCollection
        .aggregate([
            {
            $sample: {
                size: 1
            }
            }
        ]).toArray()
    if (product.length === 0) {
        return res.json({ name: "", url: "" })
    }
    return res.json(product[0])
  })
}

const connectDatabase = async () => {
  const client = await MongoClient.connect(DBHOST)
  const database = client.db(DBNAME)
  return database
}

const main = async () => {
  const dbClient = await connectDatabase()
  const app = express()
  app.use(bodyParser.json())
  setupHandlers(app, dbClient)
  app.listen(PORT, () => console.log(`Microservice listening on port ${PORT}`))
}

main()
  .then(() => console.log('Microservice online'))
  .catch((err) => {
    console.error('Microservice failed to start.')
    console.error((err && err.stack) || err)
  })
