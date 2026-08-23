import type { Metadata } from "next";
import ResetPasswordForm from "./ResetPasswordClient";

export const metadata: Metadata = {
  title: "Set New Password",
  description: "Create a strong new password for your RealEST account.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
