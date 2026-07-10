const nodemailer = require('nodemailer');

// Define transporter variable
let transporter;

async function createTransporter() {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    // Use real SMTP if credentials are provided in .env
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('📨 NodeMailer initialized with real SMTP credentials.');
  } else {
    // Fallback to Ethereal Email for testing purposes
    console.log('⚠️ No SMTP credentials found in .env. Using Ethereal Email (Fake SMTP) for testing.');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`📨 Ethereal Test Account created. User: ${testAccount.user}`);
  }
}

// Initialize the transporter
createTransporter();

/**
 * Sends an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Email body in plain text
 * @param {string} html - Email body in HTML
 */
async function sendEmail(to, subject, text, html) {
  if (!transporter) {
    await createTransporter();
  }

  try {
    const info = await transporter.sendMail({
      from: '"GreenPay ZISWAF" <noreply@greenpay.id>',
      to,
      subject,
      text,
      html,
    });

    console.log('Email sent: %s', info.messageId);

    // If using Ethereal, print the URL to view the email
    if (info.messageId && nodemailer.getTestMessageUrl(info)) {
      console.log('Preview URL (CLICK TO VIEW EMAIL): %s', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

module.exports = { sendEmail };
