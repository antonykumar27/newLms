// utils/teacherEmail.js
const sendEmail = require("../utilis/email");

const sendTeacherApprovalEmail = async (teacherEmail, data) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .card { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #4CAF50; }
        .highlight { background: #e8f5e9; padding: 10px; border-radius: 3px; margin: 10px 0; }
        .button { background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
        .footer { margin-top: 30px; text-align: center; color: #777; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Teacher Application Approved!</h1>
        </div>
        <div class="content">
          <p>Dear <strong>${data.userName}</strong>,</p>
          
          <div class="card">
            <h2>Great News!</h2>
            <p>We're excited to inform you that your teacher application has been approved on <strong>${
              data.approvalDate
            }</strong>.</p>
            ${data.welcomeMessage ? `<p>${data.welcomeMessage}</p>` : ""}
          </div>

          <div class="card">
            <h2>📊 Your Account Details</h2>
            <div class="highlight">
              <p><strong>Commission Rate:</strong> ${data.commissionRate}%</p>
              <p><strong>Contract Valid Until:</strong> ${data.expiryDate}</p>
              <p><strong>Next Review Date:</strong> ${data.nextReviewDate}</p>
            </div>
          </div>

          ${
            data.adminNotes
              ? `
          <div class="card">
            <h2>📝 Admin Notes</h2>
            <p>${data.adminNotes}</p>
          </div>
          `
              : ""
          }

          <div class="card">
            <h2>🚀 Next Steps</h2>
            <ol>
              <li>Complete your teacher profile</li>
              <li>Set up your payment information</li>
              <li>Create your first course</li>
            </ol>
            <p style="margin-top: 20px;">
              <a href="${
                data.dashboardLink
              }" class="button">Go to Teacher Dashboard</a>
            </p>
          </div>

          <div class="card">
            <h2>📚 Teacher Resources</h2>
            <ul>
              ${data.teacherResources
                .map((resource) => `<li>${resource}</li>`)
                .join("")}
            </ul>
          </div>

          <p>If you have any questions, please contact our support team at <a href="mailto:${
            data.supportEmail
          }">${data.supportEmail}</a>.</p>
          
          <p>Best regards,<br>
          <strong>The Teaching Platform Team</strong></p>

          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Your Platform Name. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Teacher Application Approved!
    
    Dear ${data.userName},
    
    We're excited to inform you that your teacher application has been approved on ${
      data.approvalDate
    }.
    
    Your Account Details:
    - Commission Rate: ${data.commissionRate}%
    - Contract Valid Until: ${data.expiryDate}
    - Next Review Date: ${data.nextReviewDate}
    
    ${data.adminNotes ? `Admin Notes: ${data.adminNotes}\n` : ""}
    
    Next Steps:
    1. Complete your teacher profile
    2. Set up your payment information
    3. Create your first course
    
    Access your dashboard: ${data.dashboardLink}
    
    Teacher Resources:
    ${data.teacherResources.map((resource) => `- ${resource}`).join("\n")}
    
    If you have any questions, please contact: ${data.supportEmail}
    
    Best regards,
    The Teaching Platform Team
  `;

  await sendEmail({
    email: teacherEmail,
    subject: "🎉 Your Teacher Application Has Been Approved!",
    message: text,
    html: html,
  });
};

const sendTeacherRejectionEmail = async (teacherEmail, data) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f44336; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .card { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #f44336; }
        .button { background: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
        .footer { margin-top: 30px; text-align: center; color: #777; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Teacher Application Status Update</h1>
        </div>
        <div class="content">
          <p>Dear <strong>${data.userName}</strong>,</p>
          
          <div class="card">
            <h2>Application Review Result</h2>
            <p>After careful consideration, we regret to inform you that your teacher application submitted on ${
              data.applicationDate
            } has not been approved at this time.</p>
            
            <h3>Reason for Rejection:</h3>
            <p>${data.rejectionReason}</p>
            
            ${
              data.feedback
                ? `
            <h3>Feedback:</h3>
            <p>${data.feedback}</p>
            `
                : ""
            }
            
            ${
              data.canReapply
                ? `
            <h3>Next Steps:</h3>
            <p>You can reapply after ${data.canReapplyDate}. We encourage you to address the feedback above before reapplying.</p>
            `
                : ""
            }
          </div>
          
          <div class="card">
            <h2>Need Help?</h2>
            <p>If you have questions about this decision or need clarification on the requirements, please contact our support team.</p>
            <p>Email: <a href="mailto:${data.supportEmail}">${
              data.supportEmail
            }</a></p>
          </div>
          
          <p>Best regards,<br>
          <strong>The Teaching Platform Team</strong></p>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Teacher Application Status Update
    
    Dear ${data.userName},
    
    After careful consideration, we regret to inform you that your teacher application submitted on ${
      data.applicationDate
    } has not been approved at this time.
    
    Reason for Rejection:
    ${data.rejectionReason}
    
    ${data.feedback ? `Feedback: ${data.feedback}\n` : ""}
    ${data.canReapply ? `You can reapply after ${data.canReapplyDate}.\n` : ""}
    
    Need Help?
    Contact: ${data.supportEmail}
    
    Best regards,
    The Teaching Platform Team
  `;

  await sendEmail({
    email: teacherEmail,
    subject: "Teacher Application Status Update",
    message: text,
    html: html,
  });
};

module.exports = {
  sendTeacherApprovalEmail,
  sendTeacherRejectionEmail,
};
