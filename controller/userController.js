const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const generateMedicalRecordNumber = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const length = 10;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Register User Endpoint
const registerUser = async (req, res) => {
  try {
    const { fullName, age, gender, contactInformation, emergencyContact, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 'contactInformation.email': contactInformation.email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already registered', user: existingUser });
    }

    // Generate a unique medical record number
    let medicalRecordNumber;
    let userWithMRN;
    do {
      medicalRecordNumber = generateMedicalRecordNumber();
      userWithMRN = await User.findOne({ medicalRecordNumber });
    } while (userWithMRN);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      age,
      gender,
      contactInformation,
      emergencyContact,
      medicalRecordNumber,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
    try {
      const { medicalRecordNumber, password } = req.body;
  
      // Log the received values
      console.log('Received medicalRecordNumber:', medicalRecordNumber);
      console.log('Received password:', password);
  
      const user = await User.findOne({ medicalRecordNumber });
  
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid medical record number or password' });
      }
  
      // Log the user details
      console.log('User found:', user);
  
      if (!user.password) {
        return res.status(400).json({ success: false, message: 'Password not set for this user' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid medical record number or password' });
      }
  
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ success: true, token, user });
    } catch (error) {
      // Log the error
      console.error('Error during login:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  };
  

const resetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await User.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true });
    res.json({ message: 'Password reset successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ 'contactInformation.email': email });
  
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
  
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      const resetLink = `https://hospital-website-backend.onrender.com/${token}`;
  
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset',
        text: `To reset your password, please click the link below:\n\n${resetLink}`
      };
  
      await transporter.sendMail(mailOptions);
  
      res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
      console.error('Error during forgot password:', error.message);
      res.status(500).json({ error: error.message });
    }
  };


  // Get user details
const getUserDetails =  async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      res.status(200).json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  
  // Update user details
  const putUserDetails = async (req, res) => {
    try {
      const { userId } = req.params;
      const updatedData = req.body;
  
      const user = await User.findByIdAndUpdate(userId, updatedData, { new: true });
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      res.status(200).json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  
  const deleteUserDetails = async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await User.findByIdAndDelete(userId);
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  const postAdmission = async (req, res) => {
    try {
      const userId = req.params.userId;
      const admissionDetails = req.body;
  
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      user.admissionDetails = admissionDetails;
      await user.save();
  
      res.json({ success: true, message: 'Admission details added successfully', admissionDetails: user.admissionDetails });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };  

const getAdmission = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.admissionDetails) {
      return res.status(404).json({ success: false, message: 'No admission details found for this user' });
    }

    res.json({ success: true, admissionDetails: user.admissionDetails, message: 'User admission retrieved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


const putAdmission = async (req, res) => {
  try {
    const userId = req.params.userId;
    const updatedAdmissionDetails = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.admissionDetails = { ...user.admissionDetails.toObject(), ...updatedAdmissionDetails };
    await user.save();

    res.json({ success: true, message: 'Admission details updated successfully', admissionDetails: user.admissionDetails });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


const postVitalSign = async (req, res) => {
  try {
    const userId = req.params.userId;
    const vitalSigns = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.vitalSigns = vitalSigns;
    await user.save();

    res.json({ success: true, message: 'Vital signs added successfully', vitalSigns: user.vitalSigns });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getVitalSign = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.vitalSigns) {
      return res.status(404).json({ success: false, message: 'No vital signs found for this user' });
    }

    res.json({ success: true, vitalSigns: user.vitalSigns });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const putVitalSign = async (req, res) => {
  try {
    const userId = req.params.userId;
    const updatedVitalSigns = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.vitalSigns = { ...user.vitalSigns.toObject(), ...updatedVitalSigns };
    await user.save();

    res.json({ success: true, message: 'Vital signs updated successfully', vitalSigns: user.vitalSigns });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


const postMedicalHistory = async (req, res) => {
  try {
    const userId = req.params.userId;
    const medicalHistory = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.medicalHistory = medicalHistory;
    await user.save();

    res.json({ success: true, message: 'Medical history added successfully', medicalHistory: user.medicalHistory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getMedicalHistory = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.medicalHistory) {
      return res.status(404).json({ success: false, message: 'No medical history found for this user' });
    }

    res.json({ success: true, medicalHistory: user.medicalHistory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


const putMedicalHistory = async (req, res) => {
  try {
    const userId = req.params.userId;
    const updatedMedicalHistory = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.medicalHistory = { ...user.medicalHistory.toObject(), ...updatedMedicalHistory };
    await user.save();

    res.json({ success: true, message: 'Medical history updated successfully', medicalHistory: user.medicalHistory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// POST add a medication for a user
const postMedication =  async (req, res) => {
  try {
    const userId = req.params.userId;
    const medication = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.currentMedications.push(medication);
    await user.save();

    res.json({ success: true, message: 'Medication added successfully', medications: user.currentMedications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET retrieve all current medications for a user
const getMedication =  async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, medications: user.currentMedications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT update a specific medication for a user
const putMedication =  async (req, res) => {
  try {
    const userId = req.params.userId;
    const medicationId = req.params.medicationId;
    const updatedMedication = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const medicationIndex = user.currentMedications.findIndex(med => med._id.toString() === medicationId);

    if (medicationIndex === -1) {
      return res.status(404).json({ success: false, message: 'Medication not found' });
    }

    user.currentMedications[medicationIndex] = { ...user.currentMedications[medicationIndex]._doc, ...updatedMedication };
    await user.save();

    res.json({ success: true, message: 'Medication updated successfully', medications: user.currentMedications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST add a treatment plan for a user
const postTreatmentPlan = async (req, res) => {
  try {
    const userId = req.params.userId;
    const treatmentPlan = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.treatmentPlans.push(treatmentPlan);
    await user.save();

    res.json({ success: true, message: 'Treatment plan added successfully', treatmentPlans: user.treatmentPlans });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET retrieve all treatment plans for a user
const getTreatmentPlan = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, treatmentPlans: user.treatmentPlans });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT update a specific treatment plan for a user
const putTreatmentPlan = async (req, res) => {
  try {
    const userId = req.params.userId;
    const planId = req.params.planId;
    const updatedPlan = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const planIndex = user.treatmentPlans.findIndex(plan => plan._id.toString() === planId);

    if (planIndex === -1) {
      return res.status(404).json({ success: false, message: 'Treatment plan not found' });
    }

    user.treatmentPlans[planIndex] = { ...user.treatmentPlans[planIndex]._doc, ...updatedPlan };
    await user.save();

    res.json({ success: true, message: 'Treatment plan updated successfully', treatmentPlans: user.treatmentPlans });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST add a lab result for a user
const postLabResult = async (req, res) => {
  try {
    const userId = req.params.userId;
    const labResult = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.labResults.push(labResult);
    await user.save();

    res.json({ success: true, message: 'Lab result added successfully', labResults: user.labResults });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET retrieve all lab results for a user
const getLabResult = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, labResults: user.labResults });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT update a specific lab result for a user
const putLabResult = async (req, res) => {
  try {
    const userId = req.params.userId;
    const resultId = req.params.resultId;
    const updatedResult = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const resultIndex = user.labResults.findIndex(result => result._id.toString() === resultId);

    if (resultIndex === -1) {
      return res.status(404).json({ success: false, message: 'Lab result not found' });
    }

    user.labResults[resultIndex] = { ...user.labResults[resultIndex]._doc, ...updatedResult };
    await user.save();

    res.json({ success: true, message: 'Lab result updated successfully', labResults: user.labResults });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST add an imaging result for a user
const postImageResult = async (req, res) => {
  try {
    const userId = req.params.userId;
    const imagingResult = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.imagingResults.push(imagingResult);
    await user.save();

    res.status(201).json({ success: true, message: 'Imaging result added successfully', imagingResults: user.imagingResults });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET retrieve all imaging results for a user
const getImageResult = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, imagingResults: user.imagingResults });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT update a specific imaging result for a user
const putImageResult = async (req, res) => {
  try {
    const userId = req.params.userId;
    const resultId = req.params.resultId;
    const updatedResult = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const resultIndex = user.imagingResults.findIndex(result => result._id.toString() === resultId);

    if (resultIndex === -1) {
      return res.status(404).json({ success: false, message: 'Imaging result not found' });
    }

    user.imagingResults[resultIndex] = { ...user.imagingResults[resultIndex]._doc, ...updatedResult };
    await user.save();

    res.status(200).json({ success: true, message: 'Imaging result updated successfully', imagingResults: user.imagingResults });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST add a care note for a user
const postCardNotes = async (req, res) => {
  try {
    const userId = req.params.userId;
    const careNote = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.careNotes.push(careNote);
    await user.save();

    res.status(201).json({ success: true, message: 'Care note added successfully', careNotes: user.careNotes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET retrieve all care notes for a user
const getCardNotes = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, careNotes: user.careNotes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT update a specific care note for a user
const putCardNotes = async (req, res) => {
  try {
    const userId = req.params.userId;
    const noteId = req.params.noteId;
    const updatedNote = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const noteIndex = user.careNotes.findIndex(note => note._id.toString() === noteId);

    if (noteIndex === -1) {
      return res.status(404).json({ success: false, message: 'Care note not found' });
    }

    user.careNotes[noteIndex] = { ...user.careNotes[noteIndex]._doc, ...updatedNote };
    await user.save();

    res.status(200).json({ success: true, message: 'Care note updated successfully', careNotes: user.careNotes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST add a scheduled care activity for a user
const postScheduleCare = async (req, res) => {
  try {
    const userId = req.params.userId;
    const scheduledCare = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.scheduledCareActivities.push(scheduledCare);
    await user.save();

    res.status(201).json({ success: true, message: 'Scheduled care activity added successfully', scheduledCareActivities: user.scheduledCareActivities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET retrieve all scheduled care activities for a user
const getScheduleCare = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, scheduledCareActivities: user.scheduledCareActivities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT update a specific scheduled care activity for a user
const putScheduleCare = async (req, res) => {
  try {
    const userId = req.params.userId;
    const activityId = req.params.activityId;
    const updatedActivity = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const activityIndex = user.scheduledCareActivities.findIndex(activity => activity._id.toString() === activityId);

    if (activityIndex === -1) {
      return res.status(404).json({ success: false, message: 'Scheduled care activity not found' });
    }

    user.scheduledCareActivities[activityIndex] = { ...user.scheduledCareActivities[activityIndex]._doc, ...updatedActivity };
    await user.save();

    res.status(200).json({ success: true, message: 'Scheduled care activity updated successfully', scheduledCareActivities: user.scheduledCareActivities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST add an alert for a user
const postAlert = async (req, res) => {
  try {
    const userId = req.params.userId;
    const alert = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.alerts.push(alert);
    await user.save();

    res.status(201).json({ success: true, message: 'Alert added successfully', alerts: user.alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET retrieve all alerts for a user
const getAlert = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, alerts: user.alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT update a specific alert for a user
const putAlert= async (req, res) => {
  try {
    const userId = req.params.userId;
    const alertId = req.params.alertId;
    const updatedAlert = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const alertIndex = user.alerts.findIndex(alert => alert._id.toString() === alertId);

    if (alertIndex === -1) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    user.alerts[alertIndex] = { ...user.alerts[alertIndex]._doc, ...updatedAlert };
    await user.save();

    res.status(200).json({ success: true, message: 'Alert updated successfully', alerts: user.alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST add billing information for a user
const postBilling = async (req, res) => {
  try {
    const userId = req.params.userId;
    const billingData = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Initialize billingInformation as an array if it's undefined
    if (!Array.isArray(user.billingInformation)) {
      user.billingInformation = [];
    }

    // Validate and format the billingData to match the schema
    const validBillingData = {
      billingStatus: billingData.billingStatus || '',
      pendingPayments: billingData.pendingPayments || 0,
      itemizedBill: billingData.itemizedBill || '',
      initialCharges: billingData.initialCharges || 0,
      interimPayments: billingData.interimPayments || [],
      finalBill: billingData.finalBill || 0,
      paymentHistory: billingData.paymentHistory || []
    };

    // Add new billing information to the array
    user.billingInformation.push(validBillingData);
    await user.save();

    res.status(201).json({ success: true, message: 'Billing information added successfully', billingInformation: user.billingInformation });
  } catch (error) {
    console.error('Error:', error); // Added for debugging
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET: Retrieve billing information
const getBilling = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, billingInformation: user.billingInformation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT: Update billing information
const putBilling = async (req, res) => {
  try {
    const userId = req.params.userId;
    const billingId = req.params.billingId;
    const billingData = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const billingIndex = user.billingInformation.findIndex(bill => bill._id.toString() === billingId);

    if (billingIndex === -1) {
      return res.status(404).json({ success: false, message: 'Billing information not found' });
    }

    user.billingInformation[billingIndex] = { ...user.billingInformation[billingIndex]._doc, ...billingData };
    await user.save();

    res.status(200).json({ success: true, message: 'Billing information updated successfully', billingInformation: user.billingInformation[billingIndex] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addInsuranceDetails = async (req, res) => {
  try {
    const userId = req.params.userId;
    const insuranceData = req.body;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Initialize insuranceDetails array if it doesn't exist
    if (!user.insuranceDetails) {
      user.insuranceDetails = []; // Ensure insuranceDetails is an array
    }

    // Add the new insurance details
    user.insuranceDetails.push(insuranceData);
    await user.save();

    res.status(201).json({ success: true, message: 'Insurance details added successfully', insuranceDetails: user.insuranceDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



const getInsuranceDetails = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).select('insuranceDetails');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, insuranceDetails: user.insuranceDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateInsuranceDetails = async (req, res) => {
  try {
    const userId = req.params.userId;
    const insuranceId = req.params.insuranceId;
    const updateData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const insurance = user.insuranceDetails.id(insuranceId);
    if (!insurance) {
      return res.status(404).json({ success: false, message: 'Insurance details not found' });
    }

    Object.assign(insurance, updateData);
    await user.save();

    res.status(200).json({ success: true, message: 'Insurance details updated successfully', insuranceDetails: user.insuranceDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addConsentForm = async (req, res) => {
  try {
    const userId = req.params.userId;
    const consentFormData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.consentForms) {
      user.consentForms = [];
    }

    user.consentForms.push(consentFormData);
    await user.save();

    res.status(201).json({ success: true, message: 'Consent form added successfully', consentForms: user.consentForms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getConsentForms = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).select('consentForms');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, consentForms: user.consentForms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateConsentForm = async (req, res) => {
  try {
    const userId = req.params.userId;
    const formId = req.params.formId;
    const updateData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const consentForm = user.consentForms.id(formId);
    if (!consentForm) {
      return res.status(404).json({ success: false, message: 'Consent form not found' });
    }

    Object.assign(consentForm, updateData);
    await user.save();

    res.status(200).json({ success: true, message: 'Consent form updated successfully', consentForms: user.consentForms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addDischargePlanning = async (req, res) => {
  try {
    const userId = req.params.userId;
    const dischargePlanningData = req.body;

    console.log(`Fetching user with ID: ${userId}`);

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('User found:', user);

    // Initialize dischargePlanning array if it doesn't exist
    if (!user.dischargePlanning) {
      console.log('Initializing dischargePlanning array');
      user.dischargePlanning = []; // Ensure dischargePlanning is an array
    }

    console.log('Adding discharge planning data:', dischargePlanningData);

    // Add the new discharge planning data
    user.dischargePlanning.push(dischargePlanningData);
    await user.save();

    res.status(201).json({ success: true, message: 'Discharge planning added successfully', dischargePlanning: user.dischargePlanning });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


const getDischargePlanning = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).select('dischargePlanning');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, dischargePlanning: user.dischargePlanning });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateDischargePlanning = async (req, res) => {
  try {
    const userId = req.params.userId;
    const dischargeId = req.params.dischargeId;
    const updateData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const dischargePlan = user.dischargePlanning.id(dischargeId);
    if (!dischargePlan) {
      return res.status(404).json({ success: false, message: 'Discharge planning not found' });
    }

    Object.assign(dischargePlan, updateData);
    await user.save();

    res.status(200).json({ success: true, message: 'Discharge planning updated successfully', dischargePlanning: user.dischargePlanning });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addPatientStatistics = async (req, res) => {
  try {
    const userId = req.params.userId;
    const statisticsData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.statistics) {
      user.statistics = [];
    }

    user.statistics.push(statisticsData);
    await user.save();

    res.status(201).json({ success: true, message: 'Patient statistics added successfully', statistics: user.statistics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPatientStatistics = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).select('statistics');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, statistics: user.statistics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePatientStatistics = async (req, res) => {
  try {
    const userId = req.params.userId;
    const statisticsId = req.params.statisticsId;
    const updateData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const statistics = user.statistics.id(statisticsId);
    if (!statistics) {
      return res.status(404).json({ success: false, message: 'Statistics not found' });
    }

    Object.assign(statistics, updateData);
    await user.save();

    res.status(200).json({ success: true, message: 'Patient statistics updated successfully', statistics: user.statistics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addPerformanceMetrics = async (req, res) => {
  try {
    const userId = req.params.userId;
    const metricsData = req.body;

    console.log(`Fetching user with ID: ${userId}`);
    console.log('Received metrics data:', metricsData);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.performanceMetrics) {
      console.log('Initializing performanceMetrics array');
      user.performanceMetrics = [];
    }

    // Make sure user.performanceMetrics is an array
    if (!Array.isArray(user.performanceMetrics)) {
      return res.status(500).json({ success: false, message: 'performanceMetrics is not an array' });
    }

    console.log('Adding metrics data:', metricsData);
    user.performanceMetrics.push(metricsData);
    await user.save();

    res.status(201).json({ success: true, message: 'Performance metrics added successfully', performanceMetrics: user.performanceMetrics });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};



const getPerformanceMetrics = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).select('performanceMetrics');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, performanceMetrics: user.performanceMetrics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePerformanceMetrics = async (req, res) => {
  try {
    const userId = req.params.userId;
    const metricsId = req.params.metricsId;
    const updateData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const metrics = user.performanceMetrics.id(metricsId);
    if (!metrics) {
      return res.status(404).json({ success: false, message: 'Performance metrics not found' });
    }

    Object.assign(metrics, updateData);
    await user.save();

    res.status(200).json({ success: true, message: 'Performance metrics updated successfully', performanceMetrics: user.performanceMetrics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserProfilePicture = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Get the file path
    const profilePicture = `/uploads/profile_pictures/${req.file.filename}`;

    // Update the user's profile picture
    const user = await User.findByIdAndUpdate(userId, { profilePicture }, { new: true });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating profile picture', error: error.message });
  }
};

const getAllUser = async (req, res) => {
  try {
    console.log("Fetching all users");
    const users = await User.find().select("-password"); // Exclude password from the response
    res.status(200).json({
      message: "Users retrieved successfully",
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: "Error retrieving users", error: error.message });
  }
};



const postLogout = (req, res) => {
  // Assuming token is sent in the Authorization header
  res.status(200).json({ success: true, message: 'Logout successful' });
};

const getUrl = (req, res) => {
  res.send("hello world");
};

module.exports = {
  registerUser,
  loginUser,
  resetPassword,
  forgotPassword,
  getUserDetails,
  putUserDetails,
  deleteUserDetails,
  postAdmission,
  getAdmission,
  putAdmission,
  postVitalSign,
  getVitalSign,
  putVitalSign,
  getMedicalHistory,
  postMedicalHistory,
  putMedicalHistory,
  postMedication,
  getMedication,
  putMedication,
  postTreatmentPlan,
  getTreatmentPlan,
  putTreatmentPlan,
  postLabResult,
  getLabResult,
  putLabResult,
  postImageResult,
  getImageResult,
  putImageResult,
  postCardNotes,
  getCardNotes,
  putCardNotes,
  postScheduleCare,
  getScheduleCare,
  putScheduleCare,
  postAlert,
  getAlert,
  putAlert,
  postBilling,
  getBilling,
  putBilling,
  addInsuranceDetails,
  getInsuranceDetails,
  updateInsuranceDetails,
  addConsentForm,
  getConsentForms,
  updateConsentForm,
  addDischargePlanning,
  getDischargePlanning,
  updateDischargePlanning,
  addPatientStatistics,
  getPatientStatistics,
  updatePatientStatistics,
  addPerformanceMetrics,
  getPerformanceMetrics,
  updatePerformanceMetrics,
  updateUserProfilePicture,
  getAllUser, 
  postLogout,
  getUrl
};
