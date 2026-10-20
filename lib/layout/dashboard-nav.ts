import type { LucideIcon } from "lucide-react";
import {
  Home,
  Heart,
  MessageSquare,
  Building,
  BarChart3,
  Shield,
  Settings,
  Bell,
  User,
  Plus,
  Wallet,
  Users,
  FileText,
  UserCheck2,
  Layout,
  HelpCircle,
  Mail,
  Megaphone,
  Users2,
} from "lucide-react";

export type DashboardNavItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

export type DashboardNavSection = {
  title: string;
  items: DashboardNavItem[];
};

export type RoleNavigation = {
  title: string;
  subtitle: string;
  sections: DashboardNavSection[];
};

export const ROLE_NAVIGATION: Record<string, RoleNavigation> = {
  user: {
    title: "User Workspace",
    subtitle: "Search, save, and manage your activity",
    sections: [
      {
        title: "Overview",
        items: [
          { href: "/profile", label: "Dashboard", description: "Your activity snapshot", icon: Home },
          { href: "/profile/favorites", label: "Saved Properties", description: "Properties you bookmarked", icon: Heart },
          { href: "/profile/my-inquiries", label: "My Inquiries", description: "Messages sent to owners", icon: MessageSquare },
        ],
      },
      {
        title: "Account",
        items: [
          { href: "/profile/edit", label: "Edit Profile", description: "Personal details and bio", icon: User },
          { href: "/profile/notifications", label: "Notifications", description: "Delivery and alert settings", icon: Bell },
          { href: "/profile/change-password", label: "Security", description: "Password and login protection", icon: Shield },
          { href: "/setting", label: "Account Settings", description: "Profile, security, and preferences", icon: Settings },
        ],
      },
    ],
  },
  owner: {
    title: "Owner Workspace",
    subtitle: "List properties and track performance",
    sections: [
      {
        title: "Overview",
        items: [
          { href: "/owner", label: "Dashboard", description: "Listings and inquiry summary", icon: Home },
          { href: "/owner/listings", label: "My Listings", description: "All of your properties", icon: Building },
          { href: "/owner/listings/new", label: "Add Property", description: "Start a new listing flow", icon: Plus },
          { href: "/owner/identity", label: "Identity", description: "Youverify NIN or BVN before a draft", icon: Shield },
        ],
      },
      {
        title: "Business",
        items: [
          { href: "/owner/inquiries", label: "Inquiries", description: "Buyer and renter messages", icon: MessageSquare },
          { href: "/owner/analytics", label: "Analytics", description: "Performance and revenue insights", icon: BarChart3 },
          { href: "/owner/premium", label: "Premium", description: "Upgrade and feature access", icon: Wallet },
          { href: "/setting", label: "Account Settings", description: "Profile, security, and preferences", icon: Settings },
        ],
      },
    ],
  },
  agent: {
    title: "Agent Workspace",
    subtitle: "Manage listings and property activity",
    sections: [
      {
        title: "Overview",
        items: [
          { href: "/agent", label: "Dashboard", description: "Listings and inquiry overview", icon: Home },
          { href: "/agent/properties", label: "My Listings", description: "Properties under your agency", icon: Building },
          { href: "/agent/properties/new", label: "Add Property", description: "Create a new agent listing", icon: Plus },
          { href: "/agent/identity", label: "Identity", description: "Youverify CAC before a draft", icon: Shield },
        ],
      },
      {
        title: "Account",
        items: [
          { href: "/setting", label: "Account Settings", description: "Profile, security, and preferences", icon: Settings },
          { href: "/setting/security", label: "Security", description: "Password and session controls", icon: Shield },
        ],
      },
    ],
  },
};

export const ADMIN_NAV_ITEMS: DashboardNavItem[] = [
  { href: "/admin", label: "Dashboard", description: "System overview", icon: Home },
  { href: "/admin/validation", label: "Property Verification", description: "Review property listings", icon: Building },
  { href: "/admin/agents", label: "Agent Verification", description: "Verify real estate agents", icon: Users },
  { href: "/admin/users", label: "User Management", description: "Manage user accounts", icon: Shield },
  { href: "/admin/content", label: "Content Management", description: "Manage platform content", icon: FileText },
  { href: "/admin/settings", label: "Admin Settings", description: "System configurations", icon: Settings },
  { href: "/admin/subadmins", label: "Sub-Admins", description: "Manage sub-admin accounts", icon: UserCheck2 },
  { href: "/admin/cms", label: "CMS Dashboard", description: "Content management overview", icon: Layout },
  { href: "/admin/support", label: "Support Center", description: "Support tickets and inquiries", icon: HelpCircle },
  { href: "/admin/emails", label: "Email Templates", description: "Preview all email templates", icon: Mail },
  { href: "/admin/emails/campaigns", label: "Email Campaigns", description: "Create and send email campaigns", icon: Megaphone },
  { href: "/admin/analytics/polls", label: "Poll Results", description: "View email poll vote results", icon: BarChart3 },
  { href: "/admin/analytics/referrals", label: "Referrals", description: "Referral tracking and attribution", icon: Users2 },
];

const MOBILE_PRIMARY: Record<string, string[]> = {
  user: ["/profile", "/profile/favorites", "/profile/my-inquiries"],
  owner: ["/owner", "/owner/listings", "/owner/listings/new", "/owner/identity"],
  agent: ["/agent", "/agent/properties", "/agent/properties/new", "/agent/identity"],
  admin: ["/admin", "/admin/validation", "/admin/agents", "/admin/users"],
};

export function roleNavigation(userRole: string | null): RoleNavigation {
  return ROLE_NAVIGATION[userRole || "user"] || ROLE_NAVIGATION.user;
}

export function flattenRoleItems(userRole: string | null): DashboardNavItem[] {
  return roleNavigation(userRole).sections.flatMap((section) => section.items);
}

export function mobilePrimaryItems(userRole: string | null): DashboardNavItem[] {
  if (userRole === "admin") {
    const hrefs = MOBILE_PRIMARY.admin;
    return ADMIN_NAV_ITEMS.filter((item) => hrefs.includes(item.href));
  }
  const hrefs = MOBILE_PRIMARY[userRole || "user"] || MOBILE_PRIMARY.user;
  const items = flattenRoleItems(userRole);
  return hrefs
    .map((href) => items.find((item) => item.href === href))
    .filter((item): item is DashboardNavItem => Boolean(item));
}

export function mobileMoreItems(userRole: string | null): DashboardNavItem[] {
  const primary = new Set(mobilePrimaryItems(userRole).map((item) => item.href));
  if (userRole === "admin") {
    return ADMIN_NAV_ITEMS.filter((item) => !primary.has(item.href));
  }
  return flattenRoleItems(userRole).filter((item) => !primary.has(item.href));
}

export function isDashboardNavActive(currentPath: string, href: string, allHrefs: string[]): boolean {
  const matchesPath = (candidate: string) => {
    if (
      candidate === "/agent" ||
      candidate === "/owner" ||
      candidate === "/profile" ||
      candidate === "/admin"
    ) {
      return currentPath === candidate;
    }
    return currentPath === candidate || currentPath.startsWith(`${candidate}/`);
  };
  const longest = allHrefs.filter(matchesPath).sort((a, b) => b.length - a.length)[0];
  return longest === href;
}
