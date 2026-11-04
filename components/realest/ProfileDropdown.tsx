"use client";

import { useRouter } from "next/navigation";
import {
  LogOut,
  Settings,
  Users,
  Home,
  Building,
  MessageSquare,
  Plus,
  BarChart3,
} from "lucide-react";
import { Avatar, Dropdown, Label } from "@heroui/react";
import { useUser } from "@/lib/hooks/useUser";
import { useLogoutModal } from "@/components/providers/LogoutModalProvider";

export function ProfileDropdown() {
  const { user, profile, role } = useUser();
  const router = useRouter();
  const { openLogoutModal } = useLogoutModal();

  // Avatar fallback logic: avatar_url -> full_name initial -> email initial -> default
  const avatarUrl = profile?.avatar_url;
  const getAvatarFallback = () =>
    profile?.full_name?.charAt(0) ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  const handleProfileClick = () => {
    router.push("/profile");
  };

  const handleSettingsClick = () => {
    router.push("/admin/settings");
  };

  const handleLogoutClick = () => {
    openLogoutModal();
  };

  // Dynamic menu items based on user role
  const getDynamicMenuItems = () => {
    const items = [];

    switch (role) {
      case "admin":
        // Admin gets quick actions, settings + profile + logout
        items.push(
          <Dropdown.Item
            key="dashboard"
            id="dashboard"
            textValue="Admin Dashboard"
            onPress={() => router.push("/admin")}
            className="hover:bg-muted px-2 rounded-xs transition-colors"
          >
            <div className="flex w-full items-center justify-between gap-2">
              <Label>Dashboard</Label>
              <Home className="size-3.5 text-muted-foreground" />
            </div>
          </Dropdown.Item>,
          <Dropdown.Item
            key="properties"
            id="properties"
            textValue="Property Verification"
            onPress={() => router.push("/admin/validation")}
            className="hover:bg-muted px-2 rounded-xs transition-colors"
          >
            <div className="flex w-full items-center justify-between gap-2">
              <Label>Property Verification</Label>
              <Building className="size-3.5 text-muted-foreground" />
            </div>
          </Dropdown.Item>,
          <Dropdown.Item
            key="agents"
            id="agents"
            textValue="Agent Verification"
            onPress={() => router.push("/admin/agents")}
            className="hover:bg-muted px-2 rounded-xs transition-colors"
          >
            <div className="flex w-full items-center justify-between gap-2">
              <Label>Agent Verification</Label>
              <Users className="size-3.5 text-muted-foreground" />
            </div>
          </Dropdown.Item>,
          <Dropdown.Item
            key="analytics"
            id="analytics"
            textValue="System Analytics"
            onPress={() => router.push("/admin/cms/analytics")}
            className="hover:bg-muted px-2 rounded-xs transition-colors"
          >
            <div className="flex w-full items-center justify-between gap-2">
              <Label>System Analytics</Label>
              <BarChart3 className="size-3.5 text-muted-foreground" />
            </div>
          </Dropdown.Item>,
          <Dropdown.Item
            key="settings"
            id="settings"
            textValue="Settings"
            onPress={handleSettingsClick}
            className="hover:bg-muted px-2 rounded-xs transition-colors"
          >
            <div className="flex w-full items-center justify-between gap-2">
              <Label>Settings</Label>
              <Settings className="size-3.5 text-muted-foreground" />
            </div>
          </Dropdown.Item>,
        );
        break;

      case "owner":
        // Owner gets list property, my listings, inquiries + profile + logout
        items.push(
          <Dropdown.Item
            key="list-property"
            id="list-property"
            textValue="List Property"
            onPress={() => router.push("/owner/list-property")}
            className="hover:bg-muted px-2 rounded-xs transition-colors"
          >
            <div className="flex w-full items-center justify-between gap-2">
              <Label>List Property</Label>
              <Plus className="size-3.5 text-muted-foreground" />
            </div>
          </Dropdown.Item>,
          <Dropdown.Item
            key="my-listings"
            id="my-listings"
            textValue="My Listings"
            onPress={() => router.push("/owner")}
            className="hover:bg-muted px-2 rounded-xs transition-colors"
          >
            <div className="flex w-full items-center justify-between gap-2">
              <Label>My Listings</Label>
              <Home className="size-3.5 text-muted-foreground" />
            </div>
          </Dropdown.Item>,
          <Dropdown.Item
            key="inquiries"
            id="inquiries"
            textValue="Inquiries"
            onPress={() => router.push("/owner/inquiries")}
            className="hover:bg-muted px-2 rounded-xs transition-colors"
          >
            <div className="flex w-full items-center justify-between gap-2">
              <Label>Inquiries</Label>
              <MessageSquare className="size-3.5 text-muted-foreground" />
            </div>
          </Dropdown.Item>,
        );
        break;

      case "agent":
        // Agent gets list property, view properties, dashboard + profile + logout
        items.push(
          <Dropdown.Item
            key="list-property"
            id="list-property"
            textValue="List Property"
            onPress={() => router.push("/agent/list-property")}
            className="hover:bg-muted px-2 rounded-xs transition-colors"
          >
            <div className="flex w-full items-center justify-between gap-2">
              <Label>List Property</Label>
              <Plus className="size-3.5 text-muted-foreground" />
            </div>
          </Dropdown.Item>,
          <Dropdown.Item
            key="properties"
            id="properties"
            textValue="My Properties"
            onPress={() => router.push("/agent/properties")}
            className="hover:bg-muted px-2 rounded-xs transition-colors"
          >
            <div className="flex w-full items-center justify-between gap-2">
              <Label>My Properties</Label>
              <Building className="size-3.5 text-muted-foreground" />
            </div>
          </Dropdown.Item>,
          <Dropdown.Item
            key="dashboard"
            id="dashboard"
            textValue="Dashboard"
            onPress={() => router.push("/agent")}
            className="hover:bg-muted px-2 rounded-xs transition-colors"
          >
            <div className="flex w-full items-center justify-between gap-2">
              <Label>Dashboard</Label>
              <BarChart3 className="size-3.5 text-muted-foreground" />
            </div>
          </Dropdown.Item>,
        );
        break;

      case "user":
      default:
        // Regular user gets only profile + logout
        break;
    }

    return items;
  };

  return (
    <Dropdown>
      <Dropdown.Trigger className="rounded-full">
        <div className="flex items-center h-auto w-auto m-auto justify-center border border-accent/70 rounded-full">
          <Avatar className="size-8">
            {avatarUrl && (
              <Avatar.Image
                alt={
                  user?.role === "admin" ? "ADMIN" : profile?.full_name || "User"
                }
                className="rounded-full"
                src={avatarUrl}
              />
            )}
            <Avatar.Fallback delayMs={600}>
              <div className="rounded-full w-full h-full size-6 border justify-center items-center flex bg-muted-foreground/10">
                {getAvatarFallback()}
              </div>
            </Avatar.Fallback>
          </Avatar>
        </div>
      </Dropdown.Trigger>
      <Dropdown.Popover className="card-enhanced w-60 shadow-lg border border-border/50 rounded-xl overflow-hidden p-0">
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center gap-2">
            <div className="w-auto h-auto border border-accent rounded-full p-0.5 flex items-center justify-center">
              <Avatar className="size-10">
                {avatarUrl ? (
                  <Avatar.Image
                    alt={profile?.full_name || "User"}
                    className="rounded-full"
                    src={avatarUrl}
                  />
                ) : (
                  <Avatar.Fallback delayMs={600}>
                    <div className="rounded-full border w-full h-full justify-center items-center flex bg-muted-foreground/10">
                      {getAvatarFallback()}
                    </div>
                  </Avatar.Fallback>
                )}
              </Avatar>
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-md leading-5 font-medium">
                {profile?.full_name || "User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
        <Dropdown.Menu className="mt-4 divide-y divide-border/20 pb-4 pt-0 p-2 space-y-4 font-medium text-sm">
          {/* Dynamic menu items based on user role */}
          {getDynamicMenuItems()}

          {/* Profile - available to all users */}
          <Dropdown.Item
            id="profile"
            textValue="Profile"
            onPress={handleProfileClick}
            className="hover:bg-muted px-2 rounded-xs transition-colors"
          >
            <Label>Profile</Label>
          </Dropdown.Item>

          {/* Logout - available to all users */}
          <Dropdown.Item
            id="logout"
            textValue="Logout"
            variant="danger"
            onPress={handleLogoutClick}
            className="hover:bg-destructive/10 px-2 rounded-xs transition-colors"
          >
            <div className="flex w-full items-center justify-between gap-2 text-red-500">
              <Label>Log Out</Label>
              <LogOut className="size-3.5" />
            </div>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
