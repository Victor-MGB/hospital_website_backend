const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors')
const authRoutes = require('./routes/auth'); // Ensure this path is correct
const billingStagesRoutes = require('./routes/billingStages'); // Ensure this path is correct
const patientsRoutes = require('./routes/patients'); // Ensure this path is correct
const medicalInfoRoutes = require('./routes/medicalInfo');
const insuranceInfoRoutes = require('./routes/insuranceInfo');
const billingInfoRoutes = require('./routes/billingInfo');
const appointmentRoutes = require('./routes/appointments');
const emergencyContact = require('./routes/emergencyInfo')
const userRoutes = require('./routes/userImage'); // Ensure this path is correct // Ensure this path is correct
const path = require('path');
const fs = require('fs')

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors()); // Add this line to enable CORS

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use('/uploads', express.static('uploads'));


app.use(express.json());
app.use('/api', authRoutes);
app.use('/api', billingStagesRoutes);
app.use('/api', patientsRoutes);
app.use('/api', medicalInfoRoutes);
app.use('/api', insuranceInfoRoutes);
app.use('/api', billingInfoRoutes);
app.use('/api', appointmentRoutes);
app.use('/api', emergencyContact)
app.use('/api', userRoutes)

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
