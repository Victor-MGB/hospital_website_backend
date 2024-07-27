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
    _id: mongoose.ObjectId,
    firstName: String,
    surname: String
  }
});

// Define the Billing Schema
const BillingSchema = new Schema({
  billingId: mongoose.ObjectId,
  amount: Number,
  billingDate: Date,
  paymentStatus: String,
  reason: String
});

// Define the Staff Details Schema
const StaffDetailsSchema = new Schema({
  staffCategory: {
    _id: mongoose.ObjectId,
    name: String
  },
  staffType: {
    _id: mongoose.ObjectId,
    type: String
  },
  staffGrade: {
    _id: mongoose.ObjectId,
    grade: String
  },
  shifts: [ShiftSchema],
  erShifts: [{
    emergencyRoomShiftId: mongoose.ObjectId,
    shiftDetails: ShiftSchema
  }]
});

// Define the Patient Details Schema
const PatientDetailsSchema = new Schema({
  admittedBy: {
    _id: mongoose.ObjectId,
    firstName: String,
    surname: String
  },
  supervisedBy: {
    _id: mongoose.ObjectId,
    firstName: String,
    surname: String
  },
  bed: {
    _id: mongoose.ObjectId,
    bedNo: Number,
    supervisedBy: {
      _id: mongoose.ObjectId,
      firstName: String,
      surname: String
    }
  },
  medication: {
    _id: mongoose.ObjectId,
    name: String,
    dosage: Number
  },
  admittedDate: Date,
  age: Number,
  billings: [BillingSchema]
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
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

// Create and export the model
const User = mongoose.model('User', UserSchema);
module.exports = User;
