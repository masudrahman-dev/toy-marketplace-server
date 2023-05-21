const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require("dotenv").config();

const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ocgiioi.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });

    const DBCollection = client.db("toyMarketplaceDB").collection("products");
    app.post("/products", async (req, res) => {
      const products = await req.body;
      res.send(products);
      //   console.log(products);
      const result = await DBCollection.insertOne(products);
      console.log(result);
    });

    app.patch("/my_toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updatedData = await req.body;
      const updatedDoc = {
        $set: updatedData,
      };
      const result = await DBCollection.updateOne(query, updatedDoc);
      // console.log(result);
      res.send(updatedData);
    });
    app.delete("/my_toys/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await DBCollection.deleteOne(query);
        console.log(result);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
    });
    app.get("/products", async (req, res) => {
      const products = await DBCollection.find({}).toArray();
      res.send(products);
    });
    app.get("/products/all_toys_table", async (req, res) => {
      // const query = {};
      let query = {};
      if (req.query.product_name) {
        query = { product_name: req.query.product_name };
      }
      const products = await DBCollection.find(query).toArray();
      res.send(products);
    });
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const product = await DBCollection.findOne(query);
      res.send(product);
    });

    app.get("/category/:id", async (req, res) => {
      const selected = req.params.id;
      const query = { category: selected };
      const products = await DBCollection.find(query).toArray();
      res.send(products);
    });
    app.get("/users/:id", async (req, res) => {
      const email = req.params.id;
      const query = { seller_email: email };
      const products = await DBCollection.find(query).toArray();
      res.send(products);
    });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on phttp://localhost:${port}`);
});
