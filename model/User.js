const mongoose = require('mongoose');
const { Schema } = mongoose;

const AddressSchema = new Schema({
  street: { type: String },
  city: { type: String },
  state: { type: String },
  zip_code: { type: String },
  country: { type: String }
}, { _id: false });

const ContactSchema = new Schema({
  phone: { type: String },
  email: { type: String },
  address: AddressSchema
}, { _id: false });

const MedicalHistorySchema = new Schema({
  condition: { type: String },
  diagnosis_date: { type: Date },
  treatment: { type: String },
  notes: { type: String }
}, { _id: false });

const MedicalInfoSchema = new Schema({
  medical_history: [{
    condition: { type: String },
    diagnosis_date: { type: Date },
    treatment: { type: String },
    notes: { type: String }
  }],
  current_medications: [{
    medication_name: { type: String },
    dosage: { type: String },
    frequency: { type: String },
    prescribed_by: { type: String }
  }],
  allergies: [{
    allergen: { type: String },
    reaction: { type: String },
    severity: { type: String }
  }],
  immunizations: [{
    vaccine: { type: String },
    date_given: { type: Date },
    notes: { type: String }
  }],
  family_history: [{
    relative: { type: String },
    condition: { type: String },
    notes: { type: String }
  }]
});

const AppointmentSchema = new mongoose.Schema({
  appointment_id: { type: mongoose.Types.ObjectId },
  date: { type: Date },
  time: { type: String },
  doctor: { type: String },
  department: { type: String },
  notes: { type: String },
  visit_summary: { type: String },
  diagnoses: [
    {
      condition: { type: String },
      details: { type: String }
    }
  ],
  follow_up: { type: String }
}, { _id: false });

const EmergencyContactSchema = new Schema({
  name: { type: String },
  relationship: { type: String },
  phone: { type: String },
  email: { type: String }
}, { _id: false });

const BillingStageSchema = new Schema({
  stage: { type: String },
  date: { type: Date },
  details: { type: String },
  paid: { type: Boolean }
});

const BillingInfoSchema = new Schema({
  payment_method: { type: String },
  billing_address: AddressSchema,
  outstanding_balance: { type: Number },
  billing_stages: [BillingStageSchema]
});

const SharedImageSchema = new Schema({
  user_id: { type: mongoose.Types.ObjectId, required: true },
  image_url: { type: String, required: true },
  shared_with: { type: mongoose.Types.ObjectId, required: true },
  shared_by: { type: mongoose.Types.ObjectId, required: true },
  timestamp: { type: Date, default: Date.now }
});


const UserSchema = new Schema({
  personal_info: {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    date_of_birth: { type: Date, required: true },
    gender: { type: String, required: true },
    contact: ContactSchema,
    profilePicture: { type: String } // Added profilePicture
  },
  medical_info: MedicalInfoSchema,
  appointments: [AppointmentSchema],
  emergency_contact: { type: EmergencyContactSchema },
  billing_info: { type: BillingInfoSchema, default: () => ({ billing_stages: [] }) }, // Ensure billing_info is initialized
  auth: {
    username: { type: String, unique: true, required: true },
    password_hash: { type: String, required: true }
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  medicalRecordNumber: { type: String, unique: true, required: true } // Added medicalRecordNumber
});

const SharedImage = mongoose.model('SharedImage', SharedImageSchema);
const User = mongoose.model('User', UserSchema);

module.exports = User;
