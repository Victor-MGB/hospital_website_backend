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

const AdmissionSchema = new Schema({
  admissionDate: { type: Date },
  department: { type: String },
  attendingPhysician: { type: String },
  roomNumber: { type: String }
});

const VitalSignsSchema = new Schema({
  temperature: { type: Number },
  bloodPressure: { type: String },
  heartRate: { type: Number },
  respiratoryRate: { type: Number },
  oxygenSaturation: { type: Number }
});

const MedicalHistorySchema = new Schema({
  diagnoses: [{ type: String }],
  surgeries: [{ type: String }],
  allergies: [{ type: String }],
  ongoingConditions: [{ type: String }]
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
  timestamp: { type: Date }
});

const ScheduledCareSchema = new Schema({
  activity: { type: String },
  schedule: { type: Date }
});

const AlertSchema = new Schema({
  type: { type: String },
  message: { type: String },
  timestamp: { type: Date }
});

const InsuranceSchema = new Schema({
  provider: { type: String },
  policyNumber: { type: String },
  coverageDetails: { type: String }
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
  signedDate: { type: Date }
});

const DischargeSchema = new Schema({
  dischargeDate: { type: Date },
  dischargeSummary: { type: String },
  postDischargeCare: { type: String }
});

const PatientStatisticsSchema = new Schema({
  admissionStatistics: { type: String },
  lengthOfStay: { type: String },
  readmissionRates: { type: String }
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
  admissionDetails: { type: AdmissionSchema },
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
  insuranceDetails: { type: InsuranceSchema },
  billingInformation: { type: BillingSchema },
  consentForms: [{ type: ConsentFormSchema }],
  dischargePlanning: { type: DischargeSchema },
  patientStatistics: { type: PatientStatisticsSchema },
  performanceMetrics: { type: PerformanceMetricsSchema },
  profilePicture: { type: String }, // Add this line for profile picture
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
