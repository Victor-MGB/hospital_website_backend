const mongoose = require('mongoose');
const { Schema } = mongoose;

let bedCounter = 0; // Initialize a counter for bed numbers

// Define the Bed Schema
const BedSchema = new Schema({
  bedNo: { type: Number, unique: true },
  roomNo: Number,
  status: { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' }
});

// Pre-save hook to generate a unique bed number
BedSchema.pre('save', function(next) {
  if (!this.bedNo) {
    this.bedNo = ++bedCounter;
  }
  next();
});

// Create and export the Bed model
const Bed = mongoose.model('Bed', BedSchema);
module.exports = Bed;
