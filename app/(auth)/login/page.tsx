import type { Metadata } from "next";
import LoginForm from "./LoginClient";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your RealEST account to browse verified properties, manage listings, and track inquiries.",
};

export default function LoginPage() {
  return <LoginForm />;
}
