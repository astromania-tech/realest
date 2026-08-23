import { Resend } from "resend";
import { config } from "dotenv";

config({ path: ".env" });

const resend = new Resend(process.env.RESEND_API_KEY);

const { data, error } = await resend.emails.send({
  from: process.env.FROM_EMAIL,
  to: ["test-8qo3ug1e3@srv1.mail-tester.com"],
  subject: "RealEST Connect — Email & BIMI Test",
  html: `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
      <h2 style="color:#07402F">RealEST Connect</h2>
      <p>This is a test email to verify <strong>SPF, DKIM, DMARC, and BIMI</strong> configuration for <strong>connect.realest.ng</strong>.</p>
      <p style="color:#999;font-size:12px">Sent via Resend · RealEST Connect</p>
    </div>
  `,
  text: "RealEST Connect — Test email to verify SPF, DKIM, DMARC and BIMI for connect.realest.ng.",
});

if (error) {
  console.error("❌ Failed:", error);
} else {
  console.log("✅ Sent! Resend ID:", data.id);
}
