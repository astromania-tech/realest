"use client";

import { Card, Button } from "@heroui/react";
import { useState } from "react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
  });

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    // TODO: Implement save logic with Supabase
    console.log("Saving notifications:", notifications);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Notification Preferences
          </h1>
          <p className="text-muted-foreground">
            Choose how you want to be notified about property updates,
            inquiries, and promotions.
          </p>
        </div>

        <Card.Root>
          <Card.Header>
            <Card.Title>Notification Settings</Card.Title>
          </Card.Header>
          <Card.Content className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive updates via email
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={() => handleToggle("email")}
                className="rounded border-border focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive text messages for important updates
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.sms}
                onChange={() => handleToggle("sms")}
                className="rounded border-border focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Get instant notifications on your device
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.push}
                onChange={() => handleToggle("push")}
                className="rounded border-border focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Marketing Communications</p>
                <p className="text-sm text-muted-foreground">
                  Receive promotional emails and offers
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.marketing}
                onChange={() => handleToggle("marketing")}
                className="rounded border-border focus:ring-2 focus:ring-primary"
              />
            </div>
          </Card.Content>
          <div className="p-6 pt-0">
            <Button onClick={handleSave} variant="primary">
              Save Preferences
            </Button>
          </div>
        </Card.Root>
      </div>
    </div>
  );
}
