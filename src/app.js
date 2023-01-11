require("dotenv").config() ;
const express = require('express');
const app = express() ;
const port = process.env.PORT || 3025 ;
const cors = require("cors") ;
app.use(cors()) ;
app.use(express.json()) ;
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.mongodb_url ;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const projects = client.db("portfolio").collection("projects") ;
const details = client.db("portfolio").collection("details") ;
const skills =  client.db("portfolio").collection("skills") ;
// const collectionMake = () => {
//    const skills =  client.db("portfolio").collection("details") ;
//   skills.insertOne({name:"skill"}) ;
// }
//  collectionMake() ;

app.get("/" , (req , res) => {
res.send("Hello this is home page !! ")
})
const runMongoDB = async () => {

app.get("/projects" , async (req , res) => {
const result  = await projects.find().toArray() ;
res.status(201).send(result) ;
})

app.get("/details/:id" , async (req , res ) => {
const id =  parseInt(req.params.id) ;
const result = await details.find({projectId:id}).toArray() ;
res.status(201).send(result) ; 
})

app.get("/skills" , async (req , res ) => {
 const result = await skills.find().toArray() ;
 res.status(201).send(result) ;
})
}
runMongoDB().catch(error => console.log("Error => " , error))
app.listen(port , (req , res) => {
console.log(`Your server running on port number:${port}`);
})