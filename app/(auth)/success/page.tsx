import type { Metadata } from "next";
import SuccessPage from "./SuccessClient";

export const metadata: Metadata = {
  title: "Check Your Email",
  description: "We've sent a verification link to your email. Open it to activate your RealEST account.",
  robots: { index: false },
};

export default function EmailSentPage() {
  return <SuccessPage />;
}
