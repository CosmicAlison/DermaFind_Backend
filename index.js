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

mongoose.connect("mongodb://localhost:27017/data");

const userSchema = new mongoose.Schema({
    activityLevel: String,
    dob: String, 
    height: String, 
    medication: Boolean, 
    name: String,
    skinHealth: String, 
    weight: String 
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

app.post('/users', async (req, res) => {
    try {
        const userData = req.body;

        const db = client.db("dermafind");
        const result = await userModel.insertOne(userData);
        res.status(201).json({ message: 'User created successfully', user: result.ops[0] });
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
        axios({
            method: "POST",
            url: "https://detect.roboflow.com/acne-zqozl/2",
            params: {
                api_key: "3vWzhnIQgKpGS53JHXtL",
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
            //const numb = predictions.length();
            rotateImage();
            loadImage("./uploads/rotate1.png").then(function(img){
            const imgWidth = img.width;
            const imgHeight = img.height;
            const canvas = createCanvas(imgHeight,imgWidth);
            const ctx = canvas.getContext('2d');
            // Rotate the canvas context by 90 degrees clockwise to draw the image
            //ctx.translate(imgWidth, 0);
            //ctx.rotate(-Math.PI / 2);
           // Draw the rotated image onto the canvas
            ctx.drawImage(img, 0, 0);
            // Reset the canvas rotation
            //ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transformation matrix
            // Draw bounding boxes and labels
            ctx.strokeStyle = '#FF0000'; // Red color for bounding boxes
            ctx.font = '20px Arial'; // Font for labels
            for (const prediction of predictions) {
              const x1 = prediction.x - prediction.width / 2;
              const x2 = prediction.x + prediction.width / 2;
              const y1 = prediction.y - prediction.height / 2;
              const y2 = prediction.y + prediction.height / 2;

              // Draw bounding box
              ctx.rect(x1, y1, prediction.width, prediction.height);
              ctx.stroke();

              // Draw label
              ctx.fillText(prediction.class, x1, y1 - 5); // Place label above the bounding box
            }
            
            // Convert canvas to image
            // Save the canvas image 
            const out = fs.createWriteStream('./uploads/detected_image.png');
            const stream = canvas.createPNGStream();
            stream.on('data', (chunk) => {
                out.write(chunk);
            });

            stream.on('end', () => {
                out.end();
                console.log('The PNG file was created successfully');
            });

            stream.on('error', (err) => {
                console.error('Error creating PNG file:', err);
            });
        });})
        .catch(function(error) {
            console.log(error.message);
        });
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