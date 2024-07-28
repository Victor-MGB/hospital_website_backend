const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Address Schema
const AddressSchema = new Schema({
  country: String,
  state: String,
  city: String,
  street: String,
  house_number: String
});

// Define the Shift Schema
const ShiftSchema = new Schema({
  name: String,
  startTime: Date,
  endTime: Date,
  incharge: {
    _id: { type: Schema.Types.ObjectId, ref: 'User' },
    firstName: String,
    surname: String
  }
});

// Define the Billing Schema
const BillingSchema = new Schema({
  billingId: { type: String }, // Changed to String
  amount: Number,
  billingDate: Date,
  paymentStatus: String,
  reason: String
});

// Define the Billing Stage Schema
const BillingStageSchema = new Schema({
  stage: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  paid: { type: Boolean, default: false }
});

// Define the Staff Details Schema
const StaffDetailsSchema = new Schema({
  staffCategory: {
    _id: { type: Schema.Types.ObjectId },
    name: String
  },
  staffType: {
    _id: { type: Schema.Types.ObjectId },
    type: String
  },
  staffGrade: {
    _id: { type: Schema.Types.ObjectId },
    grade: String
  },
  shifts: [ShiftSchema],
  erShifts: [{
    emergencyRoomShiftId: { type: Schema.Types.ObjectId },
    shiftDetails: ShiftSchema
  }]
});

// Define the Treatment Schema
const TreatmentSchema = new Schema({
  description: String,
  paymentDetails: [BillingSchema],
  images: [String]
});

// Define the Checkup Schema
const CheckupSchema = new Schema({
  description: String,
  date: Date,
  payment: BillingSchema
});

// Define the Billing Info Schema
const BillingInfoSchema = new Schema({
  payment_method: String,
  billing_address: AddressSchema,
  outstanding_balance: Number,
  billing_stages: [BillingStageSchema],
  _id: { type: Schema.Types.ObjectId }
});

// Define the Patient Details Schema
const PatientDetailsSchema = new Schema({
  admittedBy: {
    _id: { type: Schema.Types.ObjectId, ref: 'User' },
    firstName: String,
    surname: String
  },
  bed: {
    _id: { type: Schema.Types.ObjectId, ref: 'Bed' },
    bedNo: Number
  },
  doctor: {
    _id: { type: Schema.Types.ObjectId, ref: 'User' },
    firstName: String,
    surname: String
  },
  checkupDetails: [CheckupSchema],
  treatments: [TreatmentSchema],
  adminApproval: {
    type: Boolean,
    default: false
  },
  billingInfo: BillingInfoSchema // Include BillingInfoSchema here
});

// Define the User Schema
const UserSchema = new Schema({
  personal_info: {
    first_name: { type: String, required: true },
    middle_name: { type: String },
    last_name: { type: String, required: true },
    date_of_birth: { type: Date, required: true },
    gender: { type: String, required: true },
    contact: {
      phone: { type: String },
      email: { type: String, required: true }
    },
    emergencyContactNumber: { type: String },
    address: AddressSchema
  },
  auth: {
    username: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true }
  },
  medicalRecordNumber: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
  staffDetails: StaffDetailsSchema,
  patientDetails: PatientDetailsSchema,
  billingStages: [BillingStageSchema],
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

// Create and export the User model
const User = mongoose.model('User', UserSchema);
module.exports = User;
