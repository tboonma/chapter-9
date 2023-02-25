import express from 'express'
import { MongoClient } from 'mongodb'
import amqp from 'amqplib'
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

if (!process.env.RABBIT) {
  throw new Error(
    'Please specify the name of the RabbitMQ host using environment variable RABBIT'
  )
}

if (!process.env.PORT) {
  throw new Error(
    'Please specify the port for this microservice using environment variable PORT'
  )
}

const DBHOST = process.env.DBHOST
const DBNAME = process.env.DBNAME
const RABBIT = process.env.RABBIT
const PORT = process.env.PORT

const setupHandlers = (app, dbClient, messageChannel) => {
  app.get('/videos', (req, res) => {
    res.json({ status: 'success' })
  })
}

const connectDatabase = async () => {
  const client = await MongoClient.connect(DBHOST)
  return client.db(DBNAME)
}

const connectRabbitMQ = async () => {
  const connection = await amqp.connect(RABBIT)
  return connection.createChannel()
}

const main = async () => {
  const dbClient = await connectDatabase()
  const messageChannel = await connectRabbitMQ()
  const app = express()
  app.use(bodyParser.json())
  setupHandlers(app, dbClient, messageChannel)
  app.listen(PORT, () => console.log(`Microservice listening on port ${PORT}`))
}

main()
  .then(() => console.log('Microservice online'))
  .catch(() => {
    console.error('Microservice failed to start.')
    console.error((err && err.stack) || err)
  })
