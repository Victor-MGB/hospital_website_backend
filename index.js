const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const Register = require('./routes/Register')
const Login = require('./routes/Login')
const Approve = require('./routes/Approve')
const DeleteUser = require('./routes/DeleteUser')
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve static files from the uploads directory
app.use('/uploads', express.static('uploads'));
app.use('/api', Register)
app.use('/api',Login)
app.use('/api',Approve)
app.use('/api/user', DeleteUser)

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
