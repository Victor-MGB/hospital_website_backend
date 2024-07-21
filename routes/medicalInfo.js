const express = require('express');
const mongoose = require('mongoose');
const User = require('../model/User'); // Ensure this path is correct

const router = express.Router();

// Get patient medical information
router.get('/patients/:patientId/medical-info', async (req, res) => {
  const { patientId } = req.params;

  try {
    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    res.json(patient.medical_info);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching medical information', error });
  }
});

// Update patient medical information
router.put('/patients/:patientId/medical-info', async (req, res) => {
  const { patientId } = req.params;
  const updates = req.body;

  try {
    const patient = await User.findByIdAndUpdate(patientId, { $set: { medical_info: updates } }, { new: true });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    res.json({
      message: 'Medical information updated successfully',
      patientId: patient._id,
      medical_info: patient.medical_info
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating medical information', error });
  }
});

// Add a new medical condition
router.post('/patients/:patientId/medical-info/conditions', async (req, res) => {
  const { patientId } = req.params;
  const { condition, diagnosis_date, treatment, notes } = req.body;

  try {
    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const newCondition = { condition, diagnosis_date, treatment, notes };
    patient.medical_info.medical_history.push(newCondition);
    await patient.save();

    const addedCondition = patient.medical_info.medical_history.slice(-1)[0];

    res.status(201).json({
      message: 'Medical condition added successfully',
      conditionId: addedCondition._id,
      ...newCondition
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding medical condition', error });
  }
});

// Update a medical condition
router.put('/patients/:patientId/medical-info/conditions/:conditionId', async (req, res) => {
  const { patientId, conditionId } = req.params;
  const updates = req.body;

  try {
    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const condition = patient.medical_info.medical_history.id(conditionId);
    if (!condition) return res.status(404).json({ message: 'Medical condition not found' });

    Object.assign(condition, updates);
    await patient.save();

    res.json({
      message: 'Medical condition updated successfully',
      conditionId: condition._id,
      ...condition._doc
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating medical condition', error });
  }
});

// Delete a medical condition
router.delete('/patients/:patientId/medical-info/conditions/:conditionId', async (req, res) => {
  const { patientId, conditionId } = req.params;

  try {
    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const condition = patient.medical_info.medical_history.id(conditionId);
    if (!condition) return res.status(404).json({ message: 'Medical condition not found' });

    condition.remove();
    await patient.save();

    res.json({ message: 'Medical condition deleted successfully', conditionId });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting medical condition', error });
  }
});

// Add a new medication
router.post('/patients/:patientId/medical-info/medications', async (req, res) => {
  const { patientId } = req.params;
  const { medication_name, dosage, frequency, prescribed_by } = req.body;

  try {
    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const newMedication = { medication_name, dosage, frequency, prescribed_by };
    patient.medical_info.current_medications.push(newMedication);
    await patient.save();

    const addedMedication = patient.medical_info.current_medications.slice(-1)[0];

    res.status(201).json({
      message: 'Medication added successfully',
      medicationId: addedMedication._id,
      ...newMedication
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding medication', error });
  }
});

// Update a medication
router.put('/patients/:patientId/medical-info/medications/:medicationId', async (req, res) => {
  const { patientId, medicationId } = req.params;
  const updates = req.body;

  try {
    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const medication = patient.medical_info.current_medications.id(medicationId);
    if (!medication) return res.status(404).json({ message: 'Medication not found' });

    Object.assign(medication, updates);
    await patient.save();

    res.json({
      message: 'Medication updated successfully',
      medicationId: medication._id,
      ...medication._doc
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating medication', error });
  }
});

// Delete a medication
router.delete('/patients/:patientId/medical-info/medications/:medicationId', async (req, res) => {
  const { patientId, medicationId } = req.params;

  try {
    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const medication = patient.medical_info.current_medications.id(medicationId);
    if (!medication) return res.status(404).json({ message: 'Medication not found' });

    medication.remove();
    await patient.save();

    res.json({ message: 'Medication deleted successfully', medicationId });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting medication', error });
  }
});

// Add a new allergy
router.post('/patients/:patientId/medical-info/allergies', async (req, res) => {
  const { patientId } = req.params;
  const { allergen, reaction, severity } = req.body;

  try {
    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const newAllergy = { allergen, reaction, severity };
    patient.medical_info.allergies.push(newAllergy);
    await patient.save();

    const addedAllergy = patient.medical_info.allergies.slice(-1)[0];

    res.status(201).json({
      message: 'Allergy added successfully',
      allergyId: addedAllergy._id,
      ...newAllergy
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding allergy', error });
  }
});

// Update an allergy
router.put('/patients/:patientId/medical-info/allergies/:allergyId', async (req, res) => {
  const { patientId, allergyId } = req.params;
  const updates = req.body;

  try {
    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const allergy = patient.medical_info.allergies.id(allergyId);
    if (!allergy) return res.status(404).json({ message: 'Allergy not found' });

    Object.assign(allergy, updates);
    await patient.save();

    res.json({
      message: 'Allergy updated successfully',
      allergyId: allergy._id,
      ...allergy._doc
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating allergy', error });
  }
});

// Delete an allergy
router.delete('/patients/:patientId/medical-info/allergies/:allergyId', async (req, res) => {
  const { patientId, allergyId } = req.params;

  try {
    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const allergy = patient.medical_info.allergies.id(allergyId);
    if (!allergy) return res.status(404).json({ message: 'Allergy not found' });

    allergy.remove();
    await patient.save();

    res.json({ message: 'Allergy deleted successfully', allergyId });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting allergy', error });
  }
});

// Add a new immunization
router.post('/patients/:patientId/medical-info/immunizations', async (req, res) => {
  const { patientId } = req.params;
  const { immunization_name, date, administered_by } = req.body;

  try {
    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const newImmunization = { immunization_name, date, administered_by };
    patient.medical_info.immunizations.push(newImmunization);
    await patient.save();

    const addedImmunization = patient.medical_info.immunizations.slice(-1)[0];

    res.status(201).json({
      message: 'Immunization added successfully',
      immunizationId: addedImmunization._id,
      ...newImmunization
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding immunization', error });
  }
});

// Update an immunization
router.put('/patients/:patientId/medical-info/immunizations/:immunizationId', async (req, res) => {
  const { patientId, immunizationId } = req.params;
  const updates = req.body;

  try {
    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const immunization = patient.medical_info.immunizations.id(immunizationId);
    if (!immunization) return res.status(404).json({ message: 'Immunization not found' });

    Object.assign(immunization, updates);
    await patient.save();

    res.json({
      message: 'Immunization updated successfully',
      immunizationId: immunization._id,
      ...immunization._doc
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating immunization', error });
  }
});

// Delete an immunization
router.delete('/patients/:patientId/medical-info/immunizations/:immunizationId', async (req, res) => {
  const { patientId, immunizationId } = req.params;

  try {
    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const immunization = patient.medical_info.immunizations.id(immunizationId);
    if (!immunization) return res.status(404).json({ message: 'Immunization not found' });

    immunization.remove();
    await patient.save();

    res.json({ message: 'Immunization deleted successfully', immunizationId });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting immunization', error });
  }
});

// Add a new family history entry
router.post('/patients/:patientId/medical-info/family-history', async (req, res) => {
  const { patientId } = req.params;
  const { relative, condition, age_of_onset, notes } = req.body;

  try {
    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const newFamilyHistory = { relative, condition, age_of_onset, notes };
    patient.medical_info.family_history.push(newFamilyHistory);
    await patient.save();

    const addedFamilyHistory = patient.medical_info.family_history.slice(-1)[0];

    res.status(201).json({
      message: 'Family history entry added successfully',
      familyHistoryId: addedFamilyHistory._id,
      ...newFamilyHistory
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding family history entry', error });
  }
});

// Update a family history entry
router.put('/patients/:patientId/medical-info/family-history/:familyHistoryId', async (req, res) => {
  const { patientId, familyHistoryId } = req.params;
  const updates = req.body;

  try {
    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const familyHistory = patient.medical_info.family_history.id(familyHistoryId);
    if (!familyHistory) return res.status(404).json({ message: 'Family history entry not found' });

    Object.assign(familyHistory, updates);
    await patient.save();

    res.json({
      message: 'Family history entry updated successfully',
      familyHistoryId: familyHistory._id,
      ...familyHistory._doc
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating family history entry', error });
  }
});

// Delete a family history entry
router.delete('/patients/:patientId/medical-info/family-history/:familyHistoryId', async (req, res) => {
  const { patientId, familyHistoryId } = req.params;

  try {
    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const familyHistory = patient.medical_info.family_history.id(familyHistoryId);
    if (!familyHistory) return res.status(404).json({ message: 'Family history entry not found' });

    familyHistory.remove();
    await patient.save();

    res.json({ message: 'Family history entry deleted successfully', familyHistoryId });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting family history entry', error });
  }
});

module.exports = router;
