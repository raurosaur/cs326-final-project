import express, {response} from "express";
import logger from "morgan";
import {uniqid} from uniqid;
import { MongoClient } from "mongodb";

// TODO #2: Create an Express app.
const app = express();
const port = process.env.PORT || 5500;

// TODO #3: Add middleware to the Express app.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use('/', express.static('client'));

const username = process.env.username || "";
const password = process.env.password || "";

const url = `mongodb+srv://${username}:${password}@cluster01.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(url);


//save data in uniqid
app.post('/:uniqid', async (req, res)=>{
  const uniqid = req.params?.uniqid;
  const {list, id} = req.body;

  try{
    await client.connect();
    const db = client.db("PantryPal");
    const col = db.collection("shopping-list");
    await col.insertOne({uniqid,list,id});
    res.status(200).json({"status": "success"});
  }
  catch(error){
    res.status(404).json({error : "Couldn't insert"});
  }
  finally{
    await client.close();
  }
});

// Handle requests to the unique URL
app.get('/:uniqid', async (req, res) => {
  const uniqid = req.params?.uniqid;
  try{
    await client.connect();
    const db = client.db("PantryPal");
    const col = db.collection("shopping-list");

    const info = await col.findOne({$uniqid: uniqid});
    res.status(200).json(info);
  }
  catch(err){
    res.status(404).json({ error: 'User not found' });
  }
  finally{
    await client.close();
  }
});

// This matches all routes that are not defined.
app.all('*', async (request, response) => {
  response.status(404).send(`Not found: ${request.path}`);
});

// Start the server.
app.listen(port, () => {
  const msg = `Server started on http://localhost:${port}`;
  console.log(msg);
});
