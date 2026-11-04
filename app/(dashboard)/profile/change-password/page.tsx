"use client";

import { Card, Input, Button } from "@heroui/react";
import { useState } from "react";

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      // TODO: Implement password change with Supabase
      console.log("Changing password:", formData);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Password changed successfully!");
    } catch (err) {
      setError("Failed to change password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
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
                  required
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
                  required
                />
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
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-danger bg-danger-50 border border-danger-200 rounded-md p-3">
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
