// Email Service for Prescription Delivery
const nodemailer = require('nodemailer');

// Email transporter configuration
// Using Gmail SMTP or other provider
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Alternative: Using SendGrid
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send prescription email to patient
 * @param {string} to - Patient email address
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML email content
 * @returns {Promise} Email sending result
 */
async function sendPrescriptionEmail(to, subject, htmlContent) {
  try {
    // Validate email
    if (!to || !isValidEmail(to)) {
      throw new Error('Invalid email address: ' + to);
    }

    // Validate content
    if (!subject || !htmlContent) {
      throw new Error('Subject and content are required');
    }

    // Prepare email options
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@carewithoutborders.com',
      to: to,
      subject: subject,
      html: htmlContent,
      replyTo: process.env.SUPPORT_EMAIL || 'support@carewithoutborders.com'
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email sent successfully to ${to}`);
    console.log('Message ID:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Send bulk prescription emails
 * @param {Array} recipients - Array of {to: email, subject: string, html: string}
 * @returns {Promise} Results for all emails
 */
async function sendBulkEmails(recipients) {
  const results = [];
  
  for (const recipient of recipients) {
    const result = await sendPrescriptionEmail(
      recipient.to,
      recipient.subject,
      recipient.html
    );
    results.push({
      to: recipient.to,
      ...result
    });
  }
  
  return results;
}

/**
 * Send appointment reminder email
 * @param {string} to - Patient email
 * @param {object} appointmentData - Appointment details
 * @returns {Promise} Email result
 */
async function sendAppointmentReminder(to, appointmentData) {
  try {
    const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <div style="background: #0f766e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2>📅 Appointment Reminder</h2>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <p><strong>Dear ${appointmentData.patientName},</strong></p>
          <p>This is a reminder about your upcoming appointment.</p>
          
          <div style="background: white; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #0f766e;">
            <p><strong>Doctor:</strong> ${appointmentData.doctorName}</p>
            <p><strong>Date:</strong> ${appointmentData.appointmentDate}</p>
            <p><strong>Time:</strong> ${appointmentData.appointmentTime}</p>
            <p><strong>Type:</strong> ${appointmentData.type || 'Consultation'}</p>
          </div>
          
          <p>Please arrive 10 minutes early or join the video call on time.</p>
        </div>
      </body>
    </html>
    `;
    
    return await sendPrescriptionEmail(to, 'Appointment Reminder', htmlContent);
  } catch (error) {
    console.error('Error sending reminder:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send test email to verify configuration
 * @returns {Promise} Test result
 */
async function sendTestEmail() {
  try {
    const result = await transporter.verify();
    if (result) {
      console.log('✅ Email service is ready to send messages');
      return { success: true, message: 'Email service configured correctly' };
    }
  } catch (error) {
    console.error('❌ Email service error:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendPrescriptionEmail,
  sendBulkEmails,
  sendAppointmentReminder,
  sendTestEmail,
  isValidEmail
};
