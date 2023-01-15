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

   jwt.verify(getToken , process.env.scure_token , (error , decodedData) => {
    if(error) {
        return res.status(403).send({message:"unauthorize access"}) ;
    }  
        req.decodedData = decodedData ;
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

app.get("/" , (req , res) => {
res.send("Hello this is home page!!")
})
const runMongoDB = async () => {

app.get("/projects" ,verifyToken,  async (req , res) => {
const result  = await projects.find().toArray() ;
res.status(201).send(result) ;
}) 
//get single user data  
app.get("/user/:email" , verifyToken ,  async (req , res) => {
const email = req.params?.email ;
const getAdmin = await users.findOne({email:email}) ;
if(email === req.decodedData?.email && getAdmin.role ==="admin") {
const result = await users.findOne({email:email}) ;
return res.status(201).send(result) ; 
}else{
    return res.status(403).send({message:"unauthorize access"}) ; 
}

})
app.get("/details/:id"  , async (req , res ) => {
const id =  req.params.id ;
const result = await details.find({
    $or: [{projectId:id} , {projectId:parseInt(id)}]
}).toArray() ;
res.status(201).send(result) ;
})
//delete project details
app.delete("/details/:id" , verifyToken,  async (req , res) => {
const id = req.params.id ;
const authorEmailCheck = req?.decodedData?.email  ;
const findUsers = await users.findOne({email:authorEmailCheck}) ;
//check admin
if(findUsers?.email === authorEmailCheck && findUsers?.role === "admin") {
    const result = await details.deleteOne({
        $or:[{_id:ObjectId(id)} , {projectId:ObjectId(parseInt(id))}]
    }) ;
    return res.status(201).send(result) ;
 } else{
   return  res.status(403).send({message:"unauthorize access"}) ;
 }
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

app.post("/references", verifyToken ,  async(req , res) => {
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

app.get("/references" , verifyToken,  async (req , res) => {
const result = await references.find({}).toArray() ;
res.status(201).send(result) ;
})
//delete reference
app.delete("/references/:id" , verifyToken,  async(req , res) => {
const id = {_id : ObjectId(req.params.id)} ;
const authorEmailCheck = req?.decodedData?.email  ;
const findUsers = await users.findOne({email:authorEmailCheck}) ;
//check admin
if(findUsers?.email === authorEmailCheck && findUsers?.role === "admin") {
   const result = await references.deleteOne(id) ;
    return res.status(201).send(result) ;
 } else{
   return  res.status(403).send({message:"unauthorize access"}) ;
 }
})

app.get("/projects/:id", verifyToken, async (req , res ) => {
    const id = req.params.id ;
    const findById  = {_id : ObjectId(id)} ;
    const result =  await projects.findOne(findById) ;
    res.status(201).send(result) ;

    })

//add new projects
app.post("/projects" , verifyToken,  async (req,res) => {
const projectData = req.body ;
const result = await projects.insertOne(projectData) ;
res.status(201).send(result) ;
})

//update project
app.put("/projects/:id" , verifyToken, async(req , res) => {
const id = req.params.id ;
const getUpdateData = req.body ;
const authorEmailCheck = req.decodedData?.email  ;
const findUsers = await users.findOne({email:authorEmailCheck}) ;

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
//check admin
if(findUsers?.email === authorEmailCheck && findUsers?.role === "admin") {
    const result = await projects.updateOne(updateId , updateDocument , option) ;
   return res.status(201).send(result) ;
} else{
  return  res.status(403).send({message:"unauthorize access"}) ;
}

}) 

//update project details
app.put("/sectionUpdate/:id" , verifyToken ,  async(req , res) => {
    const id = req.params.id ;
    const getUpdateData = req.body ;
    const authorEmailCheck = req?.decodedData?.email  ;
   const findUsers = await users.findOne({email:authorEmailCheck}) ;

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
//check admin
if(findUsers?.email === authorEmailCheck && findUsers?.role === "admin") {
   const result = await details.updateOne(updateId , updateDocument , option) ;
   return res.status(201).send(result) ;
} else{
  return  res.status(403).send({message:"unauthorize access"}) ;
}
})

//delete project data 
app.delete("/projects/:id" , verifyToken,  async(req , res) => {
const id = req.params.id ;
const authorEmailCheck = req?.decodedData?.email  ;
const findUsers = await users.findOne({email:authorEmailCheck}) ;
//check admin
if(findUsers?.email === authorEmailCheck && findUsers?.role === "admin") {
     const result = await projects.deleteOne({_id:ObjectId(id)}) ;
     const deleteAllSection = await details.deleteMany({
        $or:[{projectId:id} , {projectId:parseInt(id)}] 
     }) ;

    return res.status(201).send({result:result , deleteAllSection:deleteAllSection}) ;
 } else{
   return  res.status(403).send({message:"unauthorize access"}) ;
 }

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
    const payload = req.body ;
    const signature = process.env.scure_token;
    const token = jwt.sign(payload , signature  , {expiresIn:"2d"})  ;
    res.status(201).send({token:token}) ;
  })
