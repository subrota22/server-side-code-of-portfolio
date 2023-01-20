
const getUsers = (app, verifyToken, users) => {

    app.get("/usersInfo", verifyToken, async (req, res) => {
        const page = parseInt(req.query.page);
        const size = parseInt(req.query.size);
        const query = {};
        const cursor = await users.find(query);
        const count = await users.estimatedDocumentCount();
        const data = await cursor.skip(page * size).limit(size).toArray();
        res.status(201).send({ count, data });
    })

};

module.exports = getUsers;
