import type { Metadata } from "next";
import OTPForm from "./OtpClient";

export const metadata: Metadata = {
  title: "Enter Verification Code",
  description: "Enter the 6-digit code sent to your email to verify your identity on RealEST.",
};

export default function OTPPage() {
  return <OTPForm />;
}
