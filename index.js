const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const mongoose = require('mongoose');
const Jimp = require('jimp');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI);
mongoose.set('debug', true);

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});


const userSchema = new mongoose.Schema({
    activityLevel: String,
    dob: String, 
    height: String, 
    medication: Boolean, 
    name: String,
    skinHealth: String, 
    weight: String,
    email: String
}, { collection : 'Users' });

const userModel = mongoose.model("Users", userSchema);

const discussionsSchema = new mongoose.Schema({
    content: String,
    author: String, 
    comments: Array, 
    likes: String, 
    time: String,
    title: String, 
    
}, { collection : 'Discussions' });

const DiscussionModel = mongoose.model("Discussions", discussionsSchema);

const scansSchema = new mongoose.Schema({
    content: String,
    author: String, 
    comments: Array, 
    likes: String, 
    time: String,
    title: String, 
    
}, { collection : 'Scans' });

const ScansModel = mongoose.model("Scans", scansSchema);

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 


app.get('/discussions', async (req, res) => {
    console.log("Getting discussions");
    try { 
        const discussions = await DiscussionModel.find({});
        console.log(discussions);
        res.json(discussions);
      }
    catch (error) {
        console.error('Error retrieving discussions:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } 
});

app.get('/user', async (req, res) => {
    try {
        const userEmail = req.query.email;

        if (!userEmail) {
            return res.status(400).json({ message: 'Email parameter is required' });
        }
        const user = await userModel.findOne({email: userEmail});
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error retrieving user data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } 
});

app.post('/createUser', async (req, res) => {
    try {
        const userData = req.body;
        const result = await userModel.create(userData);
        res.status(201).json({ message: 'User created successfully', user: result});
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Configure multer to store uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

const severity = [
    {
        grade: 0,
        lesions: 5,
        inflammatory: 0,
        nodes: 0,
    },
    {
        grade: 1,
        lesions: 10,
        inflammatory: 1,
        nodes: 0 
    },
    {
        grade: 2,
        lesions: 20,
        inflammatory: 8 ,
        nodes: 0
    },
    {
        grade: 3,
        lesions: 30 ,
        inflammatory: 15,
        nodes: 1 
    },
    {
        grade: 4,
        lesions: 50,
        inflammatory: 20,
        nodes: 5
    },

]

async function rotateImage() {
    const image = await Jimp.read(
        "./uploads/image.jpg");
         
        // rotate Function having a rotation as 55
        image.rotate(-90)
        .write('./uploads/rotate1.png');
}

app.post('/detect', upload.single('image'), async (req, res)=>{
    console.log('Received image:', req.file);
    try{
        const image = fs.readFileSync(req.file.path, {
            encoding: "base64"
        });
        response = axios({
            method: "POST",
            url: "https://detect.roboflow.com/acne-zqozl/2",
            params: {
                api_key: process.env.API_KEY_ROBOFLOW,
                confidence: "1"
            },
            data: image,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
        .then(function(response) {
            console.log(response.data);
            const predictions = response.data.predictions;

            img = loadImage(req.file.path)
            .then(function(img){
                const canvas = createCanvas(img.width, img.height);
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, img.width, img.height);

                // Draw bounding boxes and labels
                ctx.strokeStyle = '#FF0000'; // Red color for bounding boxes
                ctx.lineWidth = 2;
                ctx.font = '20px Arial'; // Font for labels
                ctx.fillStyle = 'red';

                for (const prediction of predictions) {
                    const x1 = prediction.x - prediction.width / 2;
                    const y1 = prediction.y - prediction.height / 2;

                    // Draw bounding box
                    ctx.beginPath();
                    ctx.rect(x1, y1, prediction.width, prediction.height);
                    ctx.stroke();

                    // Draw label
                    ctx.fillText(prediction.class, x1, y1 - 5);
                }

                res.setHeader('Content-Type', 'image/png');
                canvas.createPNGStream().pipe(res);
                    })

        })
    }
    catch(e){
        console.log(e);
        res.status(500).json({message:'Error detecting'});
    }
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});