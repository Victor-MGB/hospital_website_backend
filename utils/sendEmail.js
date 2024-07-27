const nodemailer = require('nodemailer');

const generateMedicalRecordNumber = () => {
  // Generate a unique medical record number
  return `MRN-${Math.floor(Math.random() * 1000000)}`;
};

const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { generateMedicalRecordNumber, sendEmail };
