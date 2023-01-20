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
const getUsers = require("./api/getUsers");
const { getUsersInformation, getSingleUserInfo, updateSingleUserInfoForAdmin, deleteSingleUserData, deleteAllUsers } = require("./api/manageUsers");
const { sendOneMail } = require("./api/sendMail");
const uri = process.env.mongodb_url ;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//all collections are here 
const projects = client.db("portfolio").collection("projects") ;
const details = client.db("portfolio").collection("details") ;
const skills =  client.db("portfolio").collection("skills") ;
const users =  client.db("portfolio").collection("users") ;
const references =  client.db("portfolio").collection("references") ;
const abouts =  client.db("portfolio").collection("abouts") ;

//verify admin
const verifyAdmin = async (req , res , next ) => {
    const email = req.decodedData?.email ;
    
    const getAdmin = await users.findOne({email:email}) ;
    if(email === getAdmin?.email && getAdmin?.role === "admin") {
       return next() ; 
    }else{
        return res.status(403).send({message:"unauthorize access"}) ;  
    }
}

app.get("/" , (req , res) => {
res.send("Hello this is home page!!")
})
const runMongoDB = async () => {
app.get("/projects" ,  async (req , res) => {
const page = parseInt(req.query.page) ; 
const size = parseInt(req.query.size ); 
//cursor and query obiliged
const query = {} ; 
const cursor = await projects.find(query) ;
const count = await projects.estimatedDocumentCount() ;
const data  = await cursor.skip(page * size).limit(size).toArray() ;
res.status(201).send({count , data}) ; 
}) 

//get single user data  
app.get("/user/:email" , verifyToken , verifyAdmin, async (req , res) => {
const email = req.params?.email ;
const result = await users.findOne({email:email}) ;
return res.status(201).send(result) ; 
}) ;
//send mail
sendOneMail(app, verifyToken , verifyAdmin ) ;
//get one section data
app.get("/singleDetailsData/:id" , async (req , res ) => {
    const id = req.params.id ;
    const result = await details.find({
        $or:[{projectId:id} , {projectId:parseInt(id)}]
    }).toArray() ;
    return res.status(201).send(result) ; 
})

//get all data with match id with section 
app.get("/details" , async (req , res ) => {
const id =  req.query.id ;
const page = parseInt(req.query.page) ; 
const size = parseInt(req.query.size ); 
//cursor and query obiliged
const query = {$or: [{projectId:id} , {projectId:parseInt(id)}]} ; 
const cursor = await details.find(query) ;
const count = await details.count({$or: [{projectId:id} , {projectId:parseInt(id)}]}) ;
const data  = await cursor.skip(page * size).limit(size).toArray() ;
res.status(201).send({count , data}) ; 
}) 

//delete project details
app.delete("/details/:id" , verifyToken , verifyAdmin ,  async (req , res) => { 
const id = req.params.id ;
const result = await details.deleteOne({_id:ObjectId(id)} ) ;
res.status(201).send(result) ; 
})

//get one section 
app.get("/projectSections/:id" , verifyToken , verifyAdmin ,  async (req , res) => {
const id = req.params.id ;
const findById = {_id : ObjectId(id)} ;
    const result = await details.findOne(findById) ;
    res.status(201).send(result) ;
})

app.post("/details" , verifyToken , verifyAdmin, async (req , res) => {
const detailsData = req.body ;
   const result = await details.insertOne(detailsData) ;
    res.status(201).send(result) ;
})
//save on reference data 
app.post("/references", verifyToken , async(req , res) => {
const referencesData = req.body;
const query = {
$or:[
    {email:req.body?.email} ,
    {phone_number:req.body?.phone_number} , 
]
}
const findData = await references.findOne(query) ;
if(findData){
return res.send({message: true , data: findData });
}
else{
const result = await references.insertOne(referencesData) ;
return res.status(201).send(result); 
}
})
//----------- references date get ----------------------> 
app.get("/references" , verifyToken,  async (req , res) => {
const page = parseInt(req.query.page) ; 
const size = parseInt(req.query.size ); 
//cursor and query obiliged
const query = {} ;
const cursor = await references.find(query) ;
const count = await references.estimatedDocumentCount() ;
const data  = await cursor.skip(page * size).limit(size).toArray() ;
res.status(201).send({count , data}) ;
})
//delete reference
app.delete("/references/:id" , verifyToken,  verifyAdmin, async(req , res) => {
const id = {_id : ObjectId(req.params.id)} ;
   const result = await references.deleteOne(id) ;
    return res.status(201).send(result) ;
})

app.get("/projects/:id", verifyToken, verifyAdmin, async (req , res ) => {
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
app.put("/projects/:id" , verifyToken, verifyAdmin, async(req , res) => {
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
   return res.status(201).send(result) ;
}) 

//update project details
app.put("/sectionUpdate/:id" , verifyToken , verifyAdmin,  async(req , res) => {
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
   return res.status(201).send(result) ;
})

//delete project data 
app.delete("/projects/:id" , verifyToken, verifyAdmin, async(req , res) => {
const id = req.params.id ;
     const result = await projects.deleteOne({
        $or:[{projectId:id} , {projectId:parseInt(id)}] 
     }) ;
     const deleteAllSection = await details.deleteMany({
        $or:[{projectId:id} , {projectId:parseInt(id)}] 
     }) ;

res.status(201).send({result:result , deleteAllSection:deleteAllSection}) ;

})
//insert new skill
app.post("/skills" , verifyToken, verifyAdmin, async (req , res) => {
const skillData = req.body ;
    const result = await skills.insertOne(skillData) ;
    res.status(201).send(result) ;
}) ;
//delete single data 
app.delete("/skills/:id" , verifyToken, verifyAdmin, async (req , res) => {
const id = req.params.id ;
    const result = await skills.deleteOne({_id : ObjectId(id)}) ;
    res.status(201).send(result) ;
});
//get single skill data 
app.get("/getSingleSkill/:id" , verifyToken , verifyAdmin, async (req , res) => {
    const id = req.params.id ;
    const result = await skills.findOne({_id : ObjectId(id)}) ;
    res.status(201).send(result) ;
    })
//get all skills
app.get("/skills" ,  async (req , res ) => { 
const page = parseInt(req.query.page) ; 
const size = parseInt(req.query.size ); 
//cursor and query obiliged
const query = {} ;
const cursor = await skills.find(query) ;
const count = await skills.estimatedDocumentCount() ;
const data  = await cursor.skip(page * size).limit(size).toArray() ;
res.status(201).send({count , data}) ;
}) 

//update skills details
app.put("/skills/:id" , verifyToken , verifyAdmin, async(req , res) => {
    const id = req.params.id ;
    const getUpdateData = req.body ;
    const updateId = {_id: ObjectId(id)} ;
    const updateDocument = {
        $set:{
            authorEmail:getUpdateData?.authorEmail ,
            authorImage:getUpdateData?.authorImage ,
            technology:getUpdateData?.technology ,
            startingDate:getUpdateData?.startingDate ,
            realTimeExperience:getUpdateData?.realTimeExperience ,
            technologyImage:getUpdateData?.technologyImage ,
            experience:getUpdateData?.experience ,
            publishDate: publishDate ,
            updatedDate : new Date().toLocaleDateString() ,
            updatedTime:new Date().toLocaleTimeString() ,
        }
        
    }
    const result = await skills.updateOne(updateId , updateDocument) ;
    return res.status(201).send(result) ;
    }) 

//user information post // >>------------------------>> users section 
app.post("/users" , async (req , res) => {
const userData = req.body ;
const findUser = await users.findOne({email :  userData?.email}) ;
if(findUser) {
return res.status(201).send({message:"activeUser"}) ;
} else if(userData?.email === "subrota45278@gmail.com") {
    const result = await users.insertOne({
        ...userData , 
         role : "admin" , 
    }) ;
    return  res.status(201).send(result) ;
} else{
    const result = await users.insertOne(userData) ;
   return  res.status(201).send(result) ;
}

});

//get user information for normal users

getUsers(app  , verifyToken,  users) ;

//get user for admin

getUsersInformation(app , verifyToken , verifyAdmin , users ) ;

//get single user for admin

getSingleUserInfo(app , verifyToken , verifyAdmin , users) ;

//update single user for admin
updateSingleUserInfoForAdmin(app , verifyToken , verifyAdmin , users) ;

//delete single user data
deleteSingleUserData(app , verifyToken , verifyAdmin , users) ;

//delete all users
deleteAllUsers(app , verifyToken , verifyAdmin , users) ; 

//get abouts data 
app.get("/abouts" , async (req , res)=>{
const aboutData = await abouts.find({}).toArray() ;
res.status(201).send(aboutData) ;
}) 
//get single about data 
app.get("/abouts/:id" , async(req , res)=>{
const id = req.params?.id;
const aboutData = await abouts.findOne({_id:ObjectId(id)});
res.status(201).send(aboutData) ;
})
//update about information
app.put("/abouts/:id" , verifyToken , verifyAdmin, async(req , res) => {
const id = req.params?.id ;
const findById = {_id : ObjectId(id)} ;
const aboutData = req.body ;
const updateDocument = {
    $set:{
        aboutText:aboutData?.aboutText ,
        adminImage:aboutData?.adminImage ,
        name:aboutData?.name ,
        websiteLink:aboutData?.websiteLink ,
        saveDate:aboutData?.saveDate ,
        updatedDate: new Date().toLocaleDateString() ,
        updatedTime:new Date().toLocaleTimeString() ,
    }
}
const result = await abouts.updateOne(findById , updateDocument) ;
res.status(201).send(result) ;
})
//add new 
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
