const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const port = process.env.PORT || 5000;

// Middle
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mjja2r0.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();


        /*----------------------
            Collection & apis
        -----------------------*/

        const usersCollection = client.db('heliverse-task').collection('users');
        const teamMembersCollection = client.db('heliverse-task').collection('teamMembers');


        // get user data with email specific
        app.get('/users', async (req, res) => {
            const limit = parseInt(req.query.limit || 20);
            const page = parseInt(req.query.page || 1);
            const skip = (page - 1) * limit;

            const search = req.query.search;

            let query = {};
            if (req.query?.gender) {
                query.gender = req.query.gender;
            }
            if (req.query?.domain) {
                query.domain = req.query.domain;
            }
            if (req.query?.availability) {
                query.available = req.query.availability === "Available" ? true : false;
            }
            if (req.query?.search) {
                query.first_name = { $regex: search, $options: "i" };
            }

            // console.log(req.query);
            // console.log(query);

            const result = await usersCollection.find(query).limit(limit).skip(skip).toArray();
            res.send(result);
        })

        // post new member to db 
        app.post("/teamMembers", async (req, res) => {
            const newMember = req.body;

            const query = { email: newMember.email };
            const existingMember = await teamMembersCollection.findOne(query);
            if (existingMember) {
                return res.send("Member already existed");
            }

            const result = await teamMembersCollection.insertOne(newMember);
            console.log(newMember);
            res.send(result);
        })

        // get new member from db
        app.get("/teamMembers", async (req, res) => {
            const result = await teamMembersCollection.find().toArray();
            res.send(result);
        })

        // delete member from db
        app.delete("/teamMembers/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await teamMembersCollection.deleteOne(query);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('heliverse task is Running!!');
})

app.listen(port, () => {
    console.log(`heliverse task is running on port: ${port}`);
})