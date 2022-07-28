const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // 1) Create a Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // 2) Define the email Options
  const mailOptions = {
    from: 'sonu <sonu@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false
    }
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
