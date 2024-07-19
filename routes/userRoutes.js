const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const multer = require('multer');
const path = require('path');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/profile_pictures');
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}_${path.extname(file.originalname)}`);
    }
  });
  
  const upload = multer({ storage: storage });

// Static routes
router.get("/users", userController.getAllUser); // Get all users
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/reset-password", userController.resetPassword);
router.post("/forgot-password", userController.forgotPassword);
router.post("/users/logout", userController.postLogout);
router.get("/", userController.getUrl);

// User-specific routes
router.put('/:userId', userController.putUserDetails);
router.get('/:userId', userController.getUserDetails);
router.delete('/:userId', userController.deleteUserDetails);

// admission routes
router.post('/:userId/admission', userController.postAdmission);
router.get('/:userId/admission', userController.getAdmission);
router.put('/:userId/admission', userController.putAdmission);

//vital signs routes
router.post('/:userId/vital-signs', userController.postVitalSign);
router.get('/:userId/vital-signs', userController.getVitalSign);
router.put('/:userId/vital-signs', userController.putVitalSign);

// medicalRecord routes
router.post('/:userId/medical-history', userController.postMedicalHistory);
router.get('/:userId/medical-history', userController.getMedicalHistory);
router.put('/:userId/medical-history', userController.putMedicalHistory);

// medication routes
router.post('/:userId/medications', userController.postMedication);
router.get('/:userId/medications', userController.getMedication);
router.put('/:userId/medications/:medicationId', userController.putMedication);

//endpoint to build user profile picture update
router.put('/:userId/profile-picture', upload.single('profilePicture'), userController.updateUserProfilePicture);


// Treatment plan
router.post('/:userId/treatment-plans', userController.postTreatmentPlan);
router.get('/:userId/treatment-plans', userController.getTreatmentPlan);
router.put('/:userId/treatment-plans/:planId', userController.putTreatmentPlan);

// Laboratory Result
router.post('/:userId/lab-results', userController.postLabResult);
router.get('/:userId/lab-results', userController.getLabResult);
router.put('/:userId/lab-results/:resultId', userController.putLabResult);

// Imaging Results
router.post('/:userId/imaging-results', userController.postImageResult);
router.get('/:userId/imaging-results', userController.getImageResult);
router.put('/:userId/imaging-results/:resultId', userController.putImageResult);

// Card Notes endpoint
router.post('/:userId/care-notes', userController.postCardNotes);
router.get('/:userId/care-notes', userController.getCardNotes);
router.put('/:userId/care-notes/:noteId', userController.putCardNotes);

//Schedule Care
router.post('/:userId/scheduled-care', userController.postScheduleCare);
router.get('/:userId/scheduled-care', userController.getScheduleCare);
router.put('/:userId/scheduled-care/:activityId', userController.putScheduleCare);

//Alert Endpoint
router.post('/:userId/alerts', userController.postAlert);
router.get('/:userId/alerts', userController.getAlert);
router.put('/:userId/alerts/:alertId', userController.putAlert);

//billing endpoint
router.post('/:userId/billing', userController.postBilling);
router.get('/:userId/billing', userController.getBilling);
router.put('/:userId/billing/:billingId', userController.putBilling);

// Insurance Details
router.post('/:userId/insurance', userController.addInsuranceDetails);
router.get('/:userId/insurance', userController.getInsuranceDetails);
router.put('/:userId/insurance/:insuranceId', userController.updateInsuranceDetails);

// Consent Forms
router.post('/:userId/consent-forms', userController.addConsentForm);
router.get('/:userId/consent-forms', userController.getConsentForms);
router.put('/:userId/consent-forms/:formId', userController.updateConsentForm);

// Discharge Planning
router.post('/:userId/discharge-planning', userController.addDischargePlanning);
router.get('/:userId/discharge-planning', userController.getDischargePlanning);
router.put('/:userId/discharge-planning/:dischargeId', userController.updateDischargePlanning);

// Patient Statistics
router.post('/:userId/statistics', userController.addPatientStatistics);
router.get('/:userId/statistics', userController.getPatientStatistics);
router.put('/:userId/statistics/:statisticsId', userController.updatePatientStatistics);

// Performance Metrics
router.post('/:userId/performance-metrics', userController.addPerformanceMetrics);
router.get('/:userId/performance-metrics', userController.getPerformanceMetrics);
router.put('/:userId/performance-metrics/:metricsId', userController.updatePerformanceMetrics);

module.exports = router;
