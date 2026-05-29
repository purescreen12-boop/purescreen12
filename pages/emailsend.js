import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = 5000; // Make sure this matches your frontend fetch calls

app.use(cors());
app.use(express.json());

// Move transporter creation outside the function for better performance
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MY_EMAIL,
    pass: process.env.MY_PASSWORD, // Must be an App Password
  },
});

function sendEmail({ recipient_email, OTP }) {
  // Validate input
  if (!recipient_email || !OTP) {
    return Promise.reject({ message: "Recipient email and OTP are required" });
  }

  const mail_configs = {
    from: `"PureScreen" <${process.env.MY_EMAIL}>`, // Proper sender format
    to: recipient_email,
    subject: "PureScreen - Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #00466a;">PureScreen</h2>
        <p>Hi,</p>
        <p>Use the following OTP to complete your Password Recovery Procedure. This code is valid for <b>5 minutes</b>.</p>
        <div style="background: #00466a; margin: 20px 0; padding: 10px; color: #fff; text-align: center; font-size: 24px; border-radius: 4px; letter-spacing: 5px;">
          ${OTP}
        </div>
        <p>If you did not request this, please ignore this email.</p>
        <hr />
        <p style="font-size: 0.8em; color: #aaa;">PureScreen Team<br/>The home of inspiring stories</p>
      </div>
    `,
  };

  return transporter.sendMail(mail_configs);
}

app.post("/send_recovery_email", async (req, res) => {
  try {
    await sendEmail(req.body);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Nodemailer Error:", error);
    res.status(500).json({ message: "Failed to send email", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});