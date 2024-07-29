const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./model/User');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const Register = require('./routes/Register');
const Login = require('./routes/Login');
const Approve = require('./routes/Approve');
const DeleteUser = require('./routes/DeleteUser');
const ForgottenPassword = require('./routes/ForgottenPassword');
const ResetPassword = require('./routes/ResetPassword');
const PatientDetails = require('./routes/PatientDetails');
const PatientStage = require('./routes/PatientStage');
const UpdatePatients = require('./routes/UpdatePatients');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:4000', // Change this to your front-end URL
  credentials: true, // Allow cookies to be sent
}));
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve static files from the uploads directory
app.use('/uploads', express.static('uploads'));
app.use('/api', Register);
app.use('/api', Login);
app.use('/api', Approve);
app.use('/api/user', DeleteUser);
app.use('/api', ForgottenPassword);
app.use('/api', ResetPassword);
app.use('/api', PatientDetails);
app.use('/api', UpdatePatients);
app.use('/api', PatientStage);

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from the database
    res.status(200).json(users); // Send users as JSON response
  } catch (error) {
    res.status(500).json({ message: 'Server error', error }); // Handle errors
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
