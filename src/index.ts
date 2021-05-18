import express from 'express';
import Shopify, { ApiVersion, AuthQuery } from '@shopify/shopify-api';
const bodyParser = require('body-parser');
require('dotenv').config();
const path = require('path');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;


const app = express();

app.use(cors())

app.use(express.static(path.join(__dirname, 'front_end/build')))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
const url = 'mongodb+srv://CistBuzz:1234@chat.jpl47.mongodb.net/email_editor?retryWrites=true&w=majority'

const client = new MongoClient(url, {
  useNewUrlParser:true,
  useUnifiedTopology: true
})

let db = null

client.connect((err, connect_client) => {
  if(err) console.log(err);
  db = connect_client.db('email_editor')
  console.log('connected')
})

const { API_KEY, API_SECRET_KEY, SCOPES,SHOP ,HOST } = process.env;

Shopify.Context.initialize({
  API_KEY,
  API_SECRET_KEY,
  SCOPES: [SCOPES],
  HOST_NAME: HOST,
  IS_EMBEDDED_APP: false,
  API_VERSION: ApiVersion.April21 // all supported versions are available, as well as "unstable" and "unversioned"
});

app.get('/login', async(req, res) => {
  console.log('login: ', API_KEY);
  
  let authRoute = await Shopify.Auth.beginAuth(
    req, 
    res, 
    SHOP, 
    '/auth/callback',
    true);
    console.log('redirecting: ');
    
  return res.redirect(authRoute)
})

let session = {}

app.get('/auth/callback', async (req, res) => {
  try {
    await Shopify.Auth.validateAuthCallback(req, res, req.query as unknown as AuthQuery); // req.query must be cast to unkown and then AuthQuery in order to be accepted
    session = await Shopify.Utils.loadCurrentSession(req, res, false)
    console.log('session created');
  } catch (error) {
    console.error(error); // in practice these should be handled more gracefully
  }
  return res.redirect('/'); // wherever you want your user to end up after OAuth completes
});

app.get('/', async (req, res) => {
  console.log('home');
  
  // const session = await Shopify.Utils.loadCurrentSession(request, response, true)
  // console.log('session: ', session);
  
  res.sendFile(path.join(__dirname, 'front_end/build/index.html'))
})

app.get('/api/session', (req, res) => {
  console.log('request for session');
  
  Object.keys(session).length === 0 ? res.send(false) : res.send(session)
})

app.post('/api/save/:id', async(req, res) => {
  console.log('saveing new template for ', req.params.id);
  
  console.log('body: ', req.body)
  let template = req.body
  let user = req.params.id
  template['user'] = user
  await db.collection('templates').insertOne(template)
  res.send(true)
})

app.get('/api/get/:id', async(req, res) => {
  const user = { user: req.params.id }
  const response = await db.collection('templates').find(user).toArray()
  console.log('templates fetched');
  res.send(response)
})

app.listen(3000, () => {
  console.log('your app is now listening on port 3000');
});