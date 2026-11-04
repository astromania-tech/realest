import { Metadata } from "next";
import { ProfileSettingsForm } from "@/components/patterns/forms";

export const metadata: Metadata = {
  title: "Edit Profile | RealEST",
  description:
    "Update your personal information, preferences, and account settings.",
};

export default function ProfileEditPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Edit Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your account information, preferences, and security settings.
          </p>
        </div>
        <ProfileSettingsForm />
      </div>
    </div>
  );
}
