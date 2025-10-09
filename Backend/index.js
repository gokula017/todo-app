import "dotenv/config";
import express from 'express'
import { MongoClient, ObjectId } from 'mongodb'
import path from "path";
import { fileURLToPath } from "url";
import cors from 'cors'
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()

const url = process.env.DB_URL
const dbName = 'todo';
let collection = "";
let token = "";

async function connection() {
    try {
        const client = new MongoClient(url);
        await client.connect()
        console.log('Database Connected')
        return client.db(dbName)
    } catch (err) {
        console.error('Database Connection failed: ', err)
    }
}

app.use(express.json())
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "https://todo-app-931h.onrender.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}))
app.use(cookieParser())

// app.get('/', (req, resp) => {
//     resp.send('Working')
// })

app.post('/add', verifyJWT, async (req, resp) => {
    try {
        if (req.body.title == "" || req.body.description == "") {
            resp.status(500).send({ message: 'Task should not be left blank', success: false })
            return
        }
        const db = await connection();
        const collection = db.collection('tasks');
        const result = await collection.insertOne(req.body);
        resp.status(200).send({ message: 'Task Added', success: true })
    } catch (err) {
        resp.status(500).send({ message: 'Failed! Task could not be added', success: false })
    }
})


app.get('/tasks', verifyJWT, async (req, resp) => {
    // console.log("Cookies Test", req.cookies['token'])
    try {
        const db = await connection();
        const collection = db.collection('tasks');
        const result = await collection.find({}).sort({ _id: -1 }).toArray();
        resp.status(200).send({ result, success: true })
    } catch (err) {
        resp.status(500).send({ message: 'Failed! Task did not found', success: false })
    }
})



app.delete('/task/:id', verifyJWT, async (req, resp) => {
    try {
        const db = await connection();
        const collection = db.collection('tasks');
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

app.get('/task/:id', verifyJWT, async (req, resp) => {
    try {
        const db = await connection();
        const collection = db.collection('tasks');
        const result = await collection.findOne({ _id: new ObjectId(req.params.id) });
        resp.status(200).send({ result, success: true })
    } catch (err) {
        resp.status(500).send({ message: 'Failed! Task could not be deleted', success: false })
    }
})

app.put('/task/:id', verifyJWT, async (req, resp) => {

    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData._id; // remove _id if present

    const db = await connection();
    const collection = db.collection('tasks');
    const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
    );
    if (result.modifiedCount > 0) {
        resp.status(200).send({ message: "Task updated successfully", success: true });
    } else {
        resp.status(404).send({ message: "Task not found or no changes", success: false });
    }
});

app.post('/signup', async (req, resp) => {
    const userData = req.body;
    if (userData.email && userData.password) {
        const db = await connection();
        const collection = await db.collection('users')
        const result = await collection.insertOne(userData)
        if (result) {
            jwt.sign(userData, 'ThankYou', { expiresIn: "5d" }, (error, token) => {
                resp.cookie("token", token, {
                    httpOnly: true,
                    secure: true,        // must be true on HTTPS (Render uses HTTPS)
                    sameSite: "None",    // required when using cross-site cookies
                    maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days
                }).status(200).send({ message: 'New user created', success: true, token })
            })
        }
    } else {
        resp.status(500).send({ message: 'Error in user creation', success: false })
    }
})

app.post('/login', async (req, resp) => {
    const userData = req.body;
    if (userData.email && userData.password) {
        const db = await connection();
        const collection = await db.collection('users')
        const result = await collection.findOne({ email: userData.email, password: userData.password })
        if (result) {
            jwt.sign(userData, 'ThankYou', { expiresIn: "5d" }, (error, token) => {
                resp.cookie("token", token, {
                    httpOnly: true,
                    secure: true,        // must be true on HTTPS (Render uses HTTPS)
                    sameSite: "None",    // required when using cross-site cookies
                    maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days
                }).status(200).send({ message: 'User logged in', success: true, token })
            })
        } else {
            resp.status(500).send({ message: 'User not found', success: false })
        }
    } else {
        resp.status(500).send({ message: 'Error in login', success: false })
    }
})

//Verify JWT Token
function verifyJWT(req, resp, next) {
    console.log("Cookies:", req.cookies);

    const token = req.cookies['token'];
    jwt.verify(token, 'ThankYou', (err, decoded) => {
        if (err) {
            return resp.send({ message: 'Invalid token', success: false })
        }
        next();
    })
}


// Serve frontend build in production
app.use(express.static(path.join(__dirname, "dist")));

// Catch-all route to serve index.html
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`App is running on port ${PORT}`))