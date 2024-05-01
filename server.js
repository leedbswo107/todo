const express = require('express');
const methodOverride = require('method-override');
const app = express();
const port = 3000;
const { MongoClient } = require('mongodb');
const url = 'mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.n3sof3h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(url);
const getDB = async () => {
  await client.connect();
  return client.db('todo');
}
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.get('/', (req, res) => res.render('index'));
// list render
app.get('/list', async (req, res) => {
  try {
    const db = await getDB();
    const post = await db.collection('post').find().sort({_id:-1}).toArray();
    res.render('list',{post});
  } catch (error) {
    console.error(error); 
  }
});
// data upload to DB & reload list
app.post('/add', async (req, res) => {
  const {title, dateOfGoals, today} = req.body;
  try {
    const db = await getDB();
    const result = await db.collection('counter').findOne({name : "counter"});
    await db.collection('post').insertOne({_id:result.totalPost+1,title, dateOfGoals, today});
    await db.collection('counter').updateOne({name:"counter"}, {$inc:{totalPost:1}});
  } catch (error) {
    console.error(error);
  }
  res.redirect('/list');
});
// 
app.get('/detail/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const db = await getDB();
    const post = await db.collection('post').findOne({_id: id});
    res.render('detail',{post});
  } catch (error) {
    console.error(error); 
  }
});
app.post('/delete', async (req, res) => {
  const id = parseInt(req.body.postNum);
  try {
    const db = await getDB();
    await db.collection('post').deleteOne({_id:id});
    res.redirect('/list');
  } catch (error) {
    console.error(error);
  }
});
//  edit page
app.get('/edit/:id', async (req,res) => {
  const id = parseInt(req.params.id);
  console.log('id확인',id);
  try {
    const db = await getDB();
    const post = await db.collection('post').findOne({_id:id});
    res.render('edit', {post});
} catch (error) {
    console.error(error);
  }
});
// edit func
app.post('/update', async (req,res) => {
  console.log(req.body);
  const {id, title, dateOfGoals, today} = req.body;
  console.log(id);
  try {
    const db = await getDB();
    await db.collection('post').updateOne({_id:parseInt(id)},{$set:{title, dateOfGoals, today}});
    res.redirect('/list');
  } catch (error) {
    console.error(error);
  }
});
app.listen(port, () => {
  console.log(`서버실행중... ${port}`);
});
