// utils/emailNotifications.js
const sendEmail = require("../utilis/email");

const sendTeacherApprovalEmail = async (email, data) => {
  try {
    await sendEmail({
      email,
      subject: "🎉 Congratulations! Your Teacher Application is Approved",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; margin-bottom: 10px;">Application Approved!</h1>
            <p style="color: #666; font-size: 16px;">Congratulations, ${data.userName}! You're now a verified teacher on LearnHub.</p>
          </div>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h3 style="color: #065f46; margin-bottom: 15px;">Next Steps</h3>
            <ol style="color: #064e3b; line-height: 1.6;">
              <li>Access your teacher dashboard</li>
              <li>Create your first course</li>
              <li>Set up payment details</li>
              <li>Complete your teacher profile</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/teacher/dashboard" 
               style="background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; 
                      border-radius: 5px; font-weight: bold; display: inline-block;">
               Go to Teacher Dashboard
            </a>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Approval email error:", error);
  }
};

const sendTeacherRejectionEmail = async (email, data) => {
  try {
    await sendEmail({
      email,
      subject: "Update on Your Teacher Application",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #ef4444; margin-bottom: 20px;">Application Update</h1>
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h3 style="color: #991b1b; margin-bottom: 10px;">Status: Not Approved</h3>
            <p><strong>Reason:</strong> ${data.reason}</p>
            ${
              data.feedback
                ? `<p><strong>Feedback:</strong> ${data.feedback}</p>`
                : ""
            }
          </div>
          <p>You can reapply after ${data.canReapplyDate}.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Rejection email error:", error);
  }
};

module.exports = {
  sendTeacherApprovalEmail,
  sendTeacherRejectionEmail,
};
