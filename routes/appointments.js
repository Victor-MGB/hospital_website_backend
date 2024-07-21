const express = require('express');
const mongoose = require('mongoose');
const User = require('../model/User'); // Ensure this path is correct

const router = express.Router();

// Get all appointments for a patient
router.get('/patients/:patientId/appointments', async (req, res) => {
  const { patientId } = req.params;

  try {
    const patient = await User.findById(patientId).select('appointments');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    res.json({
      userId: patient._id,
      appointments: patient.appointments.map(appointment => ({
        ...appointment.toObject(),
        id: appointment._id
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error });
  }
});


// router.get('/appointments/:appointmentId', async (req, res) => {
//   const { appointmentId } = req.params;

//   try {
//     // Find the patient containing the appointment
//     const patient = await User.findOne({ 'appointments._id': appointmentId });
//     if (!patient) {
//       console.log(`Patient with appointmentId ${appointmentId} not found`);
//       return res.status(404).json({ message: 'Appointment not found' });
//     }

//     console.log(`Patient found: ${patient._id}`);

//     // Find the specific appointment
//     const appointment = patient.appointments.id(appointmentId);
//     if (!appointment) {
//       console.log(`Appointment with appointmentId ${appointmentId} not found in patient ${patient._id}`);
//       return res.status(404).json({ message: 'Appointment not found' });
//     }

//     console.log(`Appointment found: ${appointment._id}`);

//     res.json({
//       userId: patient._id,
//       appointment: {
//         ...appointment.toObject(),
//         id: appointment._id
//       }
//     });
//   } catch (error) {
//     console.error("Error fetching appointment details:", error); // Log error details
//     res.status(500).json({ message: 'Error fetching appointment details', error });
//   }
// });


// Create a new appointment
router.post('/patients/:patientId/appointments', async (req, res) => {
  const { patientId } = req.params;
  const { date, time, doctor, department, notes, visit_summary, diagnoses, follow_up } = req.body;

  try {
    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const newAppointment = {
      appointment_id: new mongoose.Types.ObjectId(), // Ensure appointment_id is set
      date,
      time,
      doctor,
      department,
      notes,
      visit_summary,
      diagnoses,
      follow_up
    };

    patient.appointments.push(newAppointment);
    await patient.save();

    res.status(201).json(newAppointment);
  } catch (error) {
    console.error("Error creating appointment:", error); // Log error details
    res.status(500).json({ message: 'Error creating appointment', error });
  }
});


// // Update an appointment
// router.put('/appointments/:appointmentId', async (req, res) => {
//   const { appointmentId } = req.params;
//   const updates = req.body;

//   try {
//     const patient = await User.findOne({ 'appointments._id': appointmentId });
//     if (!patient) return res.status(404).json({ message: 'Appointment not found' });

//     const appointment = patient.appointments.id(appointmentId);
//     if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

//     Object.assign(appointment, updates);
//     await patient.save();

//     res.json({
//       ...appointment.toObject(),
//       id: appointment._id
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating appointment', error });
//   }
// });


// Delete an appointment
// router.delete('/appointments/:appointmentId', async (req, res) => {
//   const { appointmentId } = req.params;

//   try {
//     const patient = await User.findOne({ 'appointments._id': appointmentId });
//     if (!patient) return res.status(404).json({ message: 'Appointment not found' });

//     patient.appointments.id(appointmentId).remove();
//     await patient.save();

//     res.json({ message: 'Appointment deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error deleting appointment', error });
//   }
// });


module.exports = router;
