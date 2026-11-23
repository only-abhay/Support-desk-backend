import "dotenv/config";

export async function SendOtpMail(normalizedEmail, otp) {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.error("BREVO_API_KEY is missing");
      return false;
    }
    if (!normalizedEmail || !otp) {
      console.error("Email or OTP is missing");
      return false;
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: "SupportDesk",
          email: process.env.EMAIL_KEY, // must be the email you verified/added as a sender in Brevo
        },
        to: [{ email: normalizedEmail }],
        subject: "SupportDesk - Verify your email",
        textContent: `Your SupportDesk verification code is ${otp}. It expires in 3 minutes. If you did not request this code, you can safely ignore this email.`,
        htmlContent: `
          <div style="margin:0;padding:36px 16px;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
            <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
              Your SupportDesk email verification code is ${otp}.
            </div>
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden;">
              <tr>
                <td style="padding:28px 32px;background-color:#eef2ff;border-bottom:1px solid #e0e7ff;">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:38px;height:38px;border-radius:11px;background-color:#4f46e5;color:#ffffff;text-align:center;vertical-align:middle;font-size:18px;font-weight:bold;">S</td>
                      <td style="padding-left:11px;color:#0f172a;font-size:18px;font-weight:bold;">SupportDesk</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:36px 32px 32px;">
                  <p style="margin:0 0 10px;color:#4f46e5;font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;">Email verification</p>
                  <h1 style="margin:0 0 14px;color:#0f172a;font-size:25px;line-height:1.3;">Confirm your email</h1>
                  <p style="margin:0;color:#475569;font-size:15px;line-height:1.7;">Use the verification code below to finish setting up your SupportDesk account.</p>
                  <div style="margin:28px 0;padding:20px 12px;border:1px solid #e0e7ff;border-radius:14px;background-color:#f8faff;text-align:center;">
                    <p style="margin:0 0 8px;color:#64748b;font-size:11px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;">Your verification code</p>
                    <p style="margin:0;color:#3730a3;font-family:monospace;font-size:34px;font-weight:bold;letter-spacing:10px;">${otp}</p>
                  </div>
                  <p style="margin:0;color:#475569;font-size:14px;line-height:1.7;">This code expires in <strong style="color:#0f172a;">3 minutes</strong>. For your security, don&apos;t share it with anyone.</p>
                  <p style="margin:22px 0 0;color:#64748b;font-size:13px;line-height:1.7;">If you didn&apos;t request this code, you can safely ignore this email.</p>
                  <p style="margin:28px 0 0;color:#475569;font-size:14px;line-height:1.7;">Thanks,<br/><strong style="color:#0f172a;">The SupportDesk team</strong></p>
                </td>
              </tr>
            </table>
            <p style="margin:18px auto 0;max-width:560px;text-align:center;color:#94a3b8;font-size:11px;line-height:1.6;">This is an automated account security message from SupportDesk.</p>
          </div>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Brevo Error:", data);
      return false;
    }

    console.log("OTP email sent successfully:", data.messageId);
    return true;
  } catch (error) {
    console.error("Email Error:", {
      message: error.message,
    });
    return false;
  }
}
