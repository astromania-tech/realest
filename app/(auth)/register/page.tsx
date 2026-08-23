import type { Metadata } from "next";
import RegisterForm from "./RegisterClient";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Join RealEST — Nigeria's verified property marketplace. Create your free account to list or find verified properties.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
