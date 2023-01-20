const { ObjectId } = require("mongodb");
//get all  user data 
const getUsersInformation = (app , verifyToken , verifyAdmin , users ) => {
    app.get("/usersInfo", verifyToken, verifyAdmin ,  async (req, res) => {
        const page = parseInt(req.query.page);
        const size = parseInt(req.query.size);
        const query = {};
        const cursor = await users.find(query);
        const count = await users.estimatedDocumentCount();
        console.log("==>" , count);
        const data = await cursor.skip(page * size).limit(size).toArray();
        res.status(201).send({ count, data });
    })
};
//get single user data 
const getSingleUserInfo = (app , verifyToken , verifyAdmin , users ) => {
     app.get("/usersInfo/:id", verifyToken, verifyAdmin ,  async (req, res) => {
        const id = req.params.id  ;
        const query = {_id : ObjectId(id)} ;
        const result = await users.findOne(query) ;
        res.status(201).send(result) ;
    })
}


//update single user
const updateSingleUserInfoForAdmin = (app , verifyToken , verifyAdmin , users ) => {
    app.put("/usersInfo/:id", verifyToken, verifyAdmin ,  async (req, res) => {
       const id = req.params.id  ;      
       const query = {_id : ObjectId(id)} ;
       const updateData = req.body ;
       const updateDocument = {
        $set:{
            name: updateData?.name ,
            email: updateData?.email ,
            profile: updateData?.profile ,
            phoneNumber: updateData?.phoneNumber ,
            companyName: updateData?.companyName ,
            joiningDate:updateData?.joiningDate ,
            adminUpdatedDate : new Date().toLocaleDateString() ,
         }
       }
       const result = await users.updateOne(query , updateDocument) ;
       res.status(201).send(result) ;
   })
}
//delete single user data 

const deleteSingleUserData = (app , verifyToken , verifyAdmin , users ) => {
    app.delete("/usersInfo/:id", verifyToken, verifyAdmin ,  async (req, res) => {
    const id = req.params.id  ;  
    const query = {_id : ObjectId(id)} ;
    const result = await users.deleteOne(query) ;
    res.status(201).send(result) ;
} ) 
} 
//delete all users for admin

const deleteAllUsers = (app , verifyToken , verifyAdmin , users ) => {
    app.delete("/deleteAllUsers/", verifyToken, verifyAdmin ,  async (req, res) => {
        const result = await users.deleteMany({}) ;
        res.status(201).send(result) ;
    } ) 
}

module.exports ={
    getUsersInformation , getSingleUserInfo ,
    updateSingleUserInfoForAdmin , deleteSingleUserData ,
    deleteAllUsers
    } ;