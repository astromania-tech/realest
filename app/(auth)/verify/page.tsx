import type { Metadata } from "next";
import VerifyEmailPage from "./VerifyClient";

export const metadata: Metadata = {
  title: "Verifying Email",
  description: "Verifying your RealEST email address. Please wait while we confirm your account.",
  robots: { index: false },
};

export default function VerifyPage() {
  return <VerifyEmailPage />;
}
