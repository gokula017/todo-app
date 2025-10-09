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

const allowedOrigins = [
    "http://localhost:5173",           // Vite dev server
    "http://localhost:5000",           // Local Server after build
    "https://todo-app-931h.onrender.com" // Live server
];
app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
}))
app.use(cookieParser())

//========== JWT Middleware ==========
function verifyJWT(req, resp, next) {
    // console.log("Cookies:", req.cookies);

    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];

    if (!token) return resp.status(401).send({ message: "Unauthorized access", success: false });

    jwt.verify(token, 'ThankYou', (err, decoded) => {
        if (err) return resp.status(401).send({ message: 'Failed to authenticate token', success: false });
        req.userId = decoded.id;   // match JWT property
        req.uname = decoded.uname; // match JWT property
        next();
    });
}


// Signup
app.post('/signup', async (req, resp) => {

    try {
        const { uname, email, password } = req.body;
        if (!email || !password || !uname) return resp.status(400).send({ message: "Invalid input", success: false });

        const db = await connection();
        const collection = await db.collection('users')

        const result = await collection.insertOne({ uname, email, password })
        console.log(result)

        if (result) {
            const token = jwt.sign(
                { id: result.insertedId, uname, email },
                'ThankYou',
                { expiresIn: "5d" }
            );
            resp.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? "None" : "Lax",
                maxAge: 5 * 24 * 60 * 60 * 1000,
            }).status(200).send({ message: 'New user created', success: true, token });
        }
    } catch (err) {
        resp.status(500).send({ message: "Failed to create user", success: false });
    }
})

// Login
app.post('/login', async (req, resp) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return resp.status(400).send({ message: "Invalid input", success: false });

        const db = await connection();
        const collection = await db.collection('users')
        const result = await collection.findOne({ email, password })

        if (!result) return resp.status(400).send({ message: "User not found", success: false });

        if (result.password !== password) return resp.status(401).json({ message: "Wrong password" })

        const token = jwt.sign(
            { id: result._id, uname: result.uname, email: result.email },
            'ThankYou',
            { expiresIn: "1d" }
        );
        resp.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? "None" : "Lax",
            maxAge: 5 * 24 * 60 * 60 * 1000
        }).status(200).send({ message: "User logged in", success: true, token, uname: result.uname });

    } catch (err) {
        resp.status(500).send({ message: "Failed to login", success: false });
    }
})


// ======== API Routes ========

app.post('/add', verifyJWT, async (req, resp) => {

    try {
        const { title, description } = req.body;
        if (!title || !description) return resp.status(400).send({ message: "Task cannot be empty", success: false });

        const db = await connection();
        const collection = db.collection('tasks');

        console.log('Cookie token:', req.cookies.token)
        console.log('Decoded uname:', req.uname);

        const task = {
            title,
            description,
            uname: req.uname, // get name from JWT
            userId: req.userId, // link task to logged-in user
            createdAt: new Date()
        }
        console.log('Adding task:', task);

        await collection.insertOne(task);
        resp.status(200).send({ message: 'Task Added', success: true })



    } catch (err) {
        resp.status(500).send({ message: 'Failed! Task could not be added', success: false })
    }
})


app.get('/tasks', verifyJWT, async (req, resp) => {
    // console.log("Cookies Test", req)
    try {
        const db = await connection();
        const collection = db.collection('tasks');
        const result = await collection.find({ userId: req.userId }).sort({ createdAt: -1 }).toArray();
        resp.status(200).send({ result, success: true, uname: req.uname })
    } catch (err) {
        resp.status(500).send({ message: 'Failed! Task did not found', success: false })
    }
})

// Get single task
app.get('/task/:id', verifyJWT, async (req, resp) => {
    try {
        const db = await connection();
        const collection = db.collection('tasks');
        const result = await collection.findOne({ _id: new ObjectId(req.params.id), userId: req.userId });

        if (!result) return resp.status(404).send({ message: "Task not found", success: false });
        resp.status(200).send({ result, success: true })
    } catch (err) {
        console.error(err);
        resp.status(500).send({ message: 'Failed! Task could not be deleted', success: false })
    }
})

// ========== UPDATE TASK (OWN TASK ONLY) ==========
app.put('/task/:id', verifyJWT, async (req, resp) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        delete updateData._id; // remove _id if present

        const db = await connection();
        const collection = db.collection('tasks');
        const result = await collection.updateOne(
            { _id: new ObjectId(id), userId: req.userId },
            { $set: updateData }
        );

        if (result.modifiedCount === 0)
            return resp.status(404).send({ message: "Task not found or no changes", success: false });

        resp.status(200).send({ message: "Task updated", success: true });
    } catch (err) {
        console.error(err);
        resp.status(500).send({ message: "Failed to update task", success: false });
    }
});

// ========== DELETE TASK (OWN TASK ONLY) ==========
app.delete('/task/:id', verifyJWT, async (req, resp) => {
    try {
        const db = await connection();
        const collection = db.collection('tasks');
        const result = await collection.deleteOne({ _id: new ObjectId(req.params.id), userId: req.userId });
        if (result.deletedCount === 0) return resp.status(404).send({ message: 'Task not found', success: false });
        resp.status(200).send({ message: 'Task Deleted', success: true });

    } catch (err) {
        console.error(err)
        resp.status(500).send({ message: 'Failed! Task could not be deleted', success: false })
    }
})

// Serve frontend build in production
app.use(express.static(path.join(__dirname, "dist")));

// Catch-all route to serve index.html
app.get(/(.*)/, (req, resp) => resp.sendFile(path.resolve(__dirname, 'dist', 'index.html')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`App is running on port ${PORT}`))