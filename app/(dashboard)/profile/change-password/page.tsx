"use client";

import { Card, Input, Button } from "@heroui/react";
import { useState } from "react";
import { changePasswordWithCurrentPassword } from "@/lib/auth/change-password";
import { isPasswordValid } from "@/lib/auth/password-rules";
import { createClient } from "@/lib/supabase/client";

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (
    field: keyof typeof formData,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError("");
    setSuccess("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (!formData.currentPassword) {
      setError("Enter your current password.");
      return;
    }

    if (!formData.newPassword) {
      setError("Enter a new password.");
      return;
    }

    if (!isPasswordValid(formData.newPassword)) {
      setError(
        "Use at least 8 characters, including uppercase, lowercase, a number, and a symbol.",
      );
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const result = await changePasswordWithCurrentPassword(
        supabase.auth,
        formData.currentPassword,
        formData.newPassword,
      );

      if (!result.success) {
        setError(result.error);
        return;
      }

      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSuccess("Your password has been changed.");
    } catch {
      setError("We could not change your password. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-6">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Change Password
          </h1>
          <p className="text-muted-foreground">
            Update your password to keep your account secure.
          </p>
        </div>

        <Card.Root>
          <Card.Header className="text-center">
            <Card.Title>Change Password</Card.Title>
            <Card.Description>
              Enter your current password and choose a new one.
            </Card.Description>
          </Card.Header>

          <Card.Content>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="currentPassword"
                  className="text-sm font-medium"
                >
                  Current Password
                </label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                  value={formData.currentPassword}
                  onChange={(e) =>
                    handleInputChange("currentPassword", e.target.value)
                  }
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium">
                  New Password
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    handleInputChange("newPassword", e.target.value)
                  }
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Use at least 8 characters, including uppercase, lowercase, a number, and a symbol.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  Confirm New Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                />
              </div>

              {success && (
                <div
                  className="text-sm text-success bg-success/10 border border-success/20 rounded-md p-3"
                  role="status"
                  aria-live="polite"
                >
                  {success}
                </div>
              )}

              {error && (
                <div
                  className="text-sm text-danger bg-danger-50 border border-danger-200 rounded-md p-3"
                  role="alert"
                  aria-live="assertive"
                >
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isDisabled={isLoading}
              >
                {isLoading ? "Changing..." : "Change Password"}
              </Button>
            </form>
          </Card.Content>
        </Card.Root>
      </div>
    </div>
  );
}
