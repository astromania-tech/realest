import type { Metadata } from "next";
import SetupPasswordClient from "./SetupPasswordClient";

export const metadata: Metadata = {
  title: "Set Up Your Account | RealEST",
  description:
    "Create your password to activate your RealEST admin account.",
};

export default function SetupPasswordPage() {
  return <SetupPasswordClient />;
}
