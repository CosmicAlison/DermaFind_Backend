# DermaFind_Backend

## 🚀 Live URL: [DermaFind API](https://dermafind-backend.onrender.com/)

DermaFind_Backend is the backend service powering **DermaFind**, a mobile application designed for **acne detection and skincare advice**. The backend is built with **Node.js, Express, and MongoDB**, and integrates **machine learning models via Roboflow** to analyze images for acne severity.

---

## 📌 Features
- 🧑‍⚕️ **User Management**: Create and retrieve user profiles.
- 📢 **Community Discussions**: Enables users to post and interact with skincare-related discussions.
- 🏷️ **AI-Powered Acne Detection**: Accepts user-uploaded images and processes them via Roboflow’s **object detection API**.
- 🖼️ **Image Processing**: Uses **Jimp and Canvas** for image rotation, annotation, and visualization.
- 📊 **Severity Grading**: Classifies acne severity based on lesions, inflammation, and nodules.

---

## 🛠️ Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Image Processing**: Jimp, Canvas
- **Machine Learning**: Roboflow API for acne detection
- **File Uploads**: Multer

---

## 📂 API Endpoints
### 👤 User Management
- **`POST /createUser`** – Create a new user
- **`GET /user?email={email}`** – Retrieve user details

### 💬 Discussions
- **`GET /discussions`** – Fetch all discussions

### 🖼️ Acne Detection
- **`POST /detect`** – Upload an image for acne detection

---

## 🚀 Setup & Installation
### Prerequisites
Ensure you have **Node.js** and **MongoDB** installed on your system.

### Installation Steps
1. **Clone the repository**

   git clone https://github.com/CosmicAlison/DermaFind_Backend.git
   cd DermaFind_Backend

2. **Install dependencies**

   npm install

3. **Set up environment variables** in a `.env` file:

   PORT=3000
   
   MONGO_URI=your_mongodb_uri
   
   API_KEY_ROBOFLOW=your_roboflow_api_key

5. **Run the server**

   npm start


---

## 📌 How Acne Detection Works
1️⃣ User uploads an image via `/detect`.
2️⃣ The image is processed using **Jimp** (rotation & resizing).
3️⃣ The **Roboflow API** analyzes acne severity.
4️⃣ Bounding boxes are drawn on the affected areas.
5️⃣ Processed image & severity grade are returned.

---

## 🔗 Related Repositories
- **Frontend App**: _[Coming soon]_  

---

## 🛠️ Contributing
Want to contribute? Feel free to submit a pull request! 🚀

---



