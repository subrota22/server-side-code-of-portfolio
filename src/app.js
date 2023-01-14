require("dotenv").config() ;
const express = require('express');
const app = express() ;
const port = process.env.PORT || 3025 ;
const cors = require("cors") ;
app.use(cors()) ;
app.use(express.json()) ;
const jwt = require("jsonwebtoken") ;
//verify token
const verifyToken = (req , res , next ) => {
    const token = req.headers.authentication ; 
    const getToken = token.split(" ")[1] ;
    console.log("Token --> " , token);
    jwt.verify(getToken , process.env.scure_token , function(error , decoded){
    if(error){
    return res.status(403).send({message:"unauthorize access"}) ;
    }
    req.decoded = decoded ; 
    next() ;
    })
    }   

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.mongodb_url ;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
//all collections are here 
const projects = client.db("portfolio").collection("projects") ;
const details = client.db("portfolio").collection("details") ;
const skills =  client.db("portfolio").collection("skills") ;
const users =  client.db("portfolio").collection("users") ;
const references =  client.db("portfolio").collection("references") ;


// const collectionMake = () => {
//    const skills =  client.db("portfolio").collection("details") ;
//   skills.insertOne({name:"skill"}) ;
// }
//  collectionMake() ;

app.get("/" , (req , res) => {
res.send("Hello this is home page!!")
})
const runMongoDB = async () => {

app.get("/projects" , async (req , res) => {
const result  = await projects.find().toArray() ;
res.status(201).send(result) ;
})

app.get("/details/:id"  , async (req , res ) => {
const id =  req.params.id ;
const result = await details.find({
    $or: [{projectId:id} , {projectId:parseInt(id)}]
}).toArray() ;
res.status(201).send(result) ;
})

app.delete("/details/:id" , async (req , res) => {
const id = req.params.id ;
const result = await details.deleteOne({
    $or:[{_id:ObjectId(id)} , {projectId:ObjectId(parseInt(id))}]
}) ;
res.status(201).send(result) ;
})

app.get("/projectSections/:id" , async (req , res) => {
const id = req.params.id ;
const findById = {_id : ObjectId(id)} ;
const result = await details.findOne(findById) ;
res.status(201).send(result) ;
})

app.post("/details" , async (req , res) => {
const detailsData = req.body ;
const result = await details.insertOne(detailsData) ;
res.status(201).send(result) ;
})

app.post("/references", async(req , res) => {
const referencesData = req.body;
const findData = await references.findOne({email:req.body?.email}) ;
if(findData){
res.send({message: true , data: findData });
}
else{
const result = await references.insertOne(referencesData) ;
res.status(201).send(result);
}
})

app.get("/references" , async (req , res) => {
const result = await references.find({}).toArray() ;
res.status(201).send(result) ;
})

app.delete("/references/:id" , async(req , res) => {
const id = {_id : ObjectId(req.params.id)} ;
const result = await references.deleteOne(id) ;
res.status(201).send(result) ;
})

app.get("/projects/:id"  , async (req , res ) => {
    const id = req.params.id ;
    const findById  = {_id : ObjectId(id)} ;
    const result =  await projects.findOne(findById) ;
    res.status(201).send(result) ;

    })

//add new projects
app.post("/projects" ,  async (req,res) => {
const projectData = req.body ;
const result = await projects.insertOne(projectData) ;
res.status(201).send(result) ;
})

//update project
app.put("/projects/:id" , async(req , res) => {
const id = req.params.id ;
const getUpdateData = req.body ;
const updateId = {_id: ObjectId(id)} ;
const option = {upsert:true} ;
const updateDocument = {
    $set:{
        authorName:getUpdateData?.authorName ,
        authorEmail:getUpdateData?.authorEmail ,
        authorImage:getUpdateData?.authorImage ,
        serverRepositoryCode:getUpdateData?.serverRepositoryCode ,
        clientRepositoryCode:getUpdateData?.clientRepositoryCode ,
        liveWebsiteLink:getUpdateData?.liveWebsiteLink ,
        description:getUpdateData?.description ,
        projectName:getUpdateData?.projectName ,
        projectImage:getUpdateData?.projectImage ,
        publishDate:new Date().toLocaleDateString() ,
    }
}
const result = await projects.updateOne(updateId , updateDocument , option) ;
res.status(201).send(result) ;

}) 


//update project details
app.put("/sectionUpdate/:id" , async(req , res) => {
    const id = req.params.id ;
    const getUpdateData = req.body ;
    const updateId = {_id: ObjectId(id)} ;
    const option = {upsert:true} ;
    const updateDocument = {
        $set:{
            details:getUpdateData?.details ,
            authorEmail:getUpdateData?.authorEmail ,
            authorImage:getUpdateData?.authorImage ,
            projectTitle:getUpdateData?.projectTitle ,
            description:getUpdateData?.description ,
            projectName:getUpdateData?.projectName ,
            image:getUpdateData?.image ,
            publishDate:new Date().toLocaleDateString() ,
        }
    }
    const result = await details.updateOne(updateId , updateDocument , option) ;
    res.status(201).send(result) ;
    
    })

//delete project data 

app.delete("/projects/:id" , async(req , res) => {
const id = req.params.id ;
const result = await projects.deleteOne({_id:ObjectId(id)}) ;
res.status(201).send(result) ;
})

app.get("/skills"  , async (req , res ) => {
 const result = await skills.find().toArray() ;
 res.status(201).send(result) ;
})
//user information
app.post("/users" , async (req , res) => {
const userData = req.body ;
const result = await users.insertOne(userData) ;
res.status(201).send(result) ;
})
}
runMongoDB().catch(error => console.log("Error => " , error))
app.listen(port , (req , res) => {
console.log(`Your server running on port number:${port}`);
})

//generate a token
app.post("/jwt"  ,  async(req , res) => {
    const email = req.body ;
    const scure_token = process.env.scure_token;
    const token = jwt.sign(email , scure_token  , {expiresIn:"2d"})  ;
    res.status(201).send({token:token}) ;
  })
