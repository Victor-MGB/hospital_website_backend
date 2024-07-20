const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define sub-schemas for related information
const ContactSchema = new Schema({
  phoneNumber: { type: String },
  email: { type: String },
  address: { type: String }
});

const EmergencyContactSchema = new Schema({
  name: { type: String },
  phoneNumber: { type: String }
});

const AdmissionDetailsSchema = new Schema({
  admissionDate: { type: Date, required: true },
  dischargeDate: { type: Date },
  reason: { type: String, required: true }
});

const VitalSignsSchema = new Schema({
  bloodPressure: { type: String },
  heartRate: { type: Number },
  temperature: { type: Number },
  respiratoryRate: { type: Number },
  oxygenSaturation: { type: Number },
  dateRecorded: { type: Date, default: Date.now }
});

const MedicalHistorySchema = new Schema({
  conditions: [{ type: String }],
  surgeries: [{ type: String }],
  medications: [{ type: String }],
  allergies: [{ type: String }],
  familyHistory: [{ type: String }],
  dateRecorded: { type: Date, default: Date.now }
});

const MedicationSchema = new Schema({
  name: { type: String },
  dosage: { type: String },
  administrationTimes: [{ type: String }]
});

const TreatmentPlanSchema = new Schema({
  protocol: { type: String },
  upcomingProcedures: [{ type: String }]
});

const LabResultSchema = new Schema({
  testType: { type: String },
  result: { type: String },
  timestamp: { type: Date }
});

const ImagingResultSchema = new Schema({
  imagingType: { type: String },
  imageUrl: { type: String },
  timestamp: { type: Date }
});

const CareNoteSchema = new Schema({
  note: { type: String },
  date:{type:Date},
  author:{type:String},
  timestamp: { type: Date }
});

const ScheduledCareSchema = new Schema({
  activity: { type: String },
  schedule: { type: Date },
  date:{type:Date},
  timestamp: { type: Date },
  notes:{type:String}
});

const AlertSchema = new Schema({
  type: { type: String },
  message: { type: String },
  timestamp: { type: Date }
});

const InsuranceSchema = new Schema({
  provider: { type: String },
  policyNumber: { type: String },
  coverageDetails: { type: String },
  expiryDate: { type: String }
});

// Extended Billing Schema
const BillingSchema = new Schema({
  billingStatus: { type: String },
  pendingPayments: { type: Number },
  itemizedBill: { type: String },
  initialCharges: { type: Number },
  interimPayments: [{ amount: { type: Number }, date: { type: Date } }],
  finalBill: { type: Number },
  paymentHistory: [{ paymentDate: { type: Date }, amountPaid: { type: Number } }]
});


const ConsentFormSchema = new Schema({
  formName: { type: String },
  formType:{type:String},
  formDate:{type:String},
  signedBy:{type:String},
  signature:{type:String},
  signedDate: { type: Date }
});

const DischargeSchema = new Schema({
  dischargeDate: { type: Date },
  dischargeSummary: { type: String },
  postDischargeCare: { type: String }
});

const StatisticsSchema = new Schema({
  height: { type: String },
  weight: { type: String },
  BMI:{type:String},
  bloodPressure:{type:String},
  date: { type: Date, default: Date.now }
});

const PerformanceMetricsSchema = new Schema({
  responseTimes: { type: String },
  treatmentSuccessRates: { type: String },
  patientSatisfactionScores: { type: String }
});

// Main User Schema
const UserSchema = new Schema({
  fullName: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  contactInformation: { type: ContactSchema },
  emergencyContact: { type: EmergencyContactSchema },
  medicalRecordNumber: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  admissionDetails: { type: AdmissionDetailsSchema },
  vitalSigns: { type: VitalSignsSchema },
  medicalHistory: { type: MedicalHistorySchema },
  currentMedications: [{ type: MedicationSchema }],
  treatmentPlans: [{ type: TreatmentPlanSchema }],
  labResults: [{ type: LabResultSchema }],
  imagingResults: [{ type: ImagingResultSchema }],
  otherTestResults: [{ type: Schema.Types.Mixed }],
  careNotes: [{ type: CareNoteSchema }],
  scheduledCareActivities: [{ type: ScheduledCareSchema }],
  patientObservations: { type: String },
  alerts: [{ type: AlertSchema }],
  insuranceDetails: [InsuranceSchema],  // Ensure this line is included
  billingInformation: { type: [BillingSchema], default: [] }, // Ensure it's an array with a default value
  consentForms: [{ type: ConsentFormSchema }],
  dischargePlanning: [DischargeSchema],  // Ensure this line is included
  statistics: [StatisticsSchema], // Ensure this line is included
  performanceMetrics: [PerformanceMetricsSchema],  // Include this line to have performance metrics as an array
  profilePicture: { type: String, default: '' }, 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
