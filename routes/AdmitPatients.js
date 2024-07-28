const express = require('express');
const router = express.Router();
const User = require('./models/User');
const Bed = require('./models/Bed');
require('dotenv').config();

router.post('/patients/admit', async (req, res) => {
  const { medicalRecordNumber, admittedById, bedId, doctorId, checkupDetails } = req.body;

  try {
    const patient = await User.findOne({ medicalRecordNumber });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const bed = await Bed.findById(bedId);
    if (!bed || bed.status !== 'available') {
      return res.status(400).json({ message: 'Bed is not available' });
    }

    const admittedBy = await User.findById(admittedById);
    const doctor = await User.findById(doctorId);

    patient.patientDetails = {
      admittedBy: {
        _id: admittedBy._id,
        firstName: admittedBy.personal_info.first_name,
        surname: admittedBy.personal_info.last_name
      },
      doctor: {
        _id: doctor._id,
        firstName: doctor.personal_info.first_name,
        surname: doctor.personal_info.last_name,
        department: doctor.staffDetails.staffCategory.name
      },
      bed: {
        _id: bed._id,
        bedNo: bed.bedNo,
        roomNo: bed.roomNo
      },
      checkupDetails,
      admittedDate: new Date(),
      age: patient.personal_info.age
    };

    bed.status = 'occupied';

    await patient.save();
    await bed.save();

    res.status(200).json({ message: 'Patient admitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
