import "dotenv/config";
import express from 'express'
import { MongoClient, ObjectId } from 'mongodb'
import path from "path";
import { fileURLToPath } from "url";
import cors from 'cors'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()

const url = process.env.DB_URL
const dbName = 'todo';
const collectionName = 'tasks';
let collection = "";

async function connectDB() {
    try {
        const client = new MongoClient(url);
        await client.connect()
        const db = client.db(dbName)
        collection = db.collection(collectionName)
        console.log('Database Connected')
    } catch (err) {
        console.error('Database Connection failed: ', err)
    }
}

connectDB()

app.use(express.json())
app.use(cors())

// app.get('/', (req, resp) => {
//     resp.send('Working')
// })

app.post('/add', async (req, resp) => {
    try {
        const result = await collection.insertOne(req.body);
        resp.status(200).send({ message: 'Task Added', success: true })
    } catch (err) {
        resp.status(500).send({ message: 'Failed! Task could not be added', success: false })
    }
})


app.get('/tasks', async (req, resp) => {
    try {
        const result = await collection.find({}).sort({ _id: -1 }).toArray();
        resp.status(200).send({ result, success: true })
    } catch (err) {
        resp.status(500).send({ message: 'Failed! Task did not found', success: false })
    }
})


app.delete('/task/:id', async (req, resp) => {
    try {
        const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount > 0) {
            resp.status(200).send({ message: 'Task Deleted', success: true });
        } else {
            resp.status(404).send({ message: 'Task not found', success: false });
        }
    } catch (err) {
        resp.status(500).send({ message: 'Failed! Task could not be deleted', success: false })
    }
})

app.get('/task/:id', async (req, resp) => {
    try {
        const result = await collection.findOne({ _id: new ObjectId(req.params.id) });
        resp.status(200).send({ result, success: true })
    } catch (err) {
        resp.status(500).send({ message: 'Failed! Task could not be deleted', success: false })
    }
})

app.put('/task/:id', async (req, resp) => {

    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData._id; // remove _id if present

    const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
    );
    if (result.modifiedCount > 0) {
        resp.status(200).send({ message: "Task updated successfully", success: true });
    } else {
        resp.status(404).send({ message: "Task not found or no changes", success: false });
    }
})

// Serve frontend build in production
app.use(express.static(path.join(__dirname, "dist"))); 

// Catch-all route to serve index.html
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`App is running on port ${PORT}`))