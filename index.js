require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");

const port = process.env.port || 4000;
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_ID}:${process.env.USER_KEY}@cluster0.d2cwisz.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();

    const noteCollection = client.db("notesBD").collection("notes");

    app.post("/notes", async (req, res) => {
      const note = req.body;
      const result = await noteCollection.insertOne(note);
      res.send(result);
    });

    app.patch("/notes/:id", async (req, res) => {
      const note = req.body;
      const id = req.params.id;

      const filter = { _id: new ObjectId(id) };
      const updateNote = {
        $set: {
          pin: note.pin,
          color: note.color,
        },
      };
      const result = await noteCollection.updateOne(filter, updateNote);
    });

    app.get("/notes", async (req, res) => {
      const id = req.headers.authorization;
      const filter = { uid: id };
      const result = await noteCollection.find(filter).toArray();

      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.log);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
