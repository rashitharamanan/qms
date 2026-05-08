const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Note: if you use a service like SendGrid, set SMTP_HOST to smtp.sendgrid.net
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT, // commonly 587 or 465
    auth: {
      user: process.env.SMTP_EMAIL, // SendGrid generic user is usually 'apikey'
      pass: process.env.SMTP_PASSWORD, // This is where the SendGrid API key goes
    },
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html, // Optional HTML version
  };

  const info = await transporter.sendMail(message);
  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
