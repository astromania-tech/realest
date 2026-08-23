import type { Metadata } from "next";
import ForgotPasswordForm from "./ForgotPasswordClient";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Forgot your RealEST password? Enter your email address and we'll send you a secure reset code.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
