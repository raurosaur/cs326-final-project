import express, {response} from "express";
import logger from "morgan";
import { MongoClient } from "mongodb";
import { v4 as uuidv4 } from 'uuid';

// TODO #2: Create an Express app.
const app = express();
const port = process.env.PORT || 5500;

// TODO #3: Add middleware to the Express app.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use("/", express.static('client'));

const password = process.env.password || "mohkav-jevmuc-5pokGe";

const url = `mongodb+srv://raurosaur:${password}@cluster01.2bz1e9m.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(url);

// Delete data after 3 days
try{
  await client.connect();
  const db = client.db("PantryPal");
  const col = db.collection("shopping-list");
  await col.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 30 });
}
catch(err){
  console.log(err);
}
finally{
  await client.close();
}

//create/update data in uniqid
app.post('/list/:uniqid', async (req, res)=>{
  let uniqid = req.params?.uniqid;
  const {list, id} = req.body;
  
  try{
    await client.connect();
    const db = client.db("PantryPal");
    const col = db.collection("shopping-list");
    if (uniqid === "notnew"){
      uniqid = uuidv4();
      await col.insertOne({uniqid,list,id, "createdAt": new Date()});
    }
    else
      await col.findOneAndUpdate({uniqid}, {"$set":{list, id, "createdAt": new Date()}});
    res.status(200).json({"status": "success", "id": uniqid});
  }
  catch(error){
    res.status(404).json({error : "Couldn't insert"});
  }
  finally{
    await client.close();
  }
});


//reads data
app.get('/list/:uniqid', async (req, res) => {
  const uniqid = req.params?.uniqid;
  try{
    await client.connect();
    const db = client.db("PantryPal");
    const col = db.collection("shopping-list");
    const info = await col.findOne({uniqid: uniqid});
    res.status(200).json(info);
  }
  catch(err){
    res.status(404).json({ error: 'User not found' });
  }
  finally{
    await client.close();
  }
});

//delete entry
app.delete('/delete/:uniqid', async (req, res) => {
  const uniqid = req.params.uniqid;
  console.log(uniqid)
  try{
    await client.connect();
    const db = client.db("PantryPal");
    const col = db.collection("shopping-list");
    if (uniqid !== "notnew"){
      console.log(await col.deleteOne({"uniqid":uniqid}));
      res.status(200).json({"status": "success"});
    }
    else
      res.status(404).json({error: "entry doesn't exist"})
  }
  catch(error){
    res.status(404).json({error : "Couldn't delete"});
  }
  finally{
    await client.close();
  }
});

app.get('/getNewId', (req, res) => {
  res.status(200).json({id:uuidv4()});
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
