/** Labels for admin_audit_log rows. Detail stays short and skips notes, reasons, and emails. */

const CASE_ACTIONS = new Set([
  "assign_field_team_leader",
  "confirm_field_team",
  "physical_vetting",
  "registry_confirmation",
  "ml_validation_update",
  "duplicate_check_queued",
  "duplicate_resolution",
  "duplicate_resolution_reject",
  "document_validation_queued",
  "image_validation_queued",
  "admin_property_create",
  "property_vetting",
  "delete_property",
  "update_property_status",
]);

const USER_ACTIONS = new Set([
  "user_moderation",
  "invite_staff",
  "create_subadmin",
  "approve_agent",
  "reject_agent",
]);

const VETTING_TITLES: Record<string, string> = {
  check_in: "Checked in at the pin",
  approve: "Approved the visit",
  reject: "Rejected the listing",
  flag_issue: "Flagged an issue on a visit",
  request_correction: "Sent a file back for correction",
  confirm_registry: "Recorded a registry check",
};

const MODERATION_TITLES: Record<string, string> = {
  suspend: "Suspended a user",
  unsuspend: "Lifted a suspension",
  ban: "Banned a user",
  unban: "Lifted a ban",
};

export function activityScope(raw: string | undefined): "all" | "mine" {
  return raw === "mine" ? "mine" : "all";
}

export function activityHref(action: string, targetId: string | null): string | null {
  if (!targetId) return null;
  if (CASE_ACTIONS.has(action)) return `/admin/validation/cases/${targetId}`;
  if (USER_ACTIONS.has(action)) return `/admin/users/${targetId}`;
  return null;
}

function metaString(metadata: unknown, key: string): string | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function activityLabel(
  action: string,
  metadata: unknown,
): { title: string; detail: string | null } {
  const nested = metaString(metadata, "action");
  let title: string;
  if (action === "physical_vetting" || action === "registry_confirmation") {
    title = (nested && VETTING_TITLES[nested]) || "Recorded a visit decision";
  } else if (action === "user_moderation") {
    title = (nested && MODERATION_TITLES[nested]) || "Updated a user account";
  } else if (action === "assign_field_team_leader") {
    title = "Assigned a field team leader";
  } else if (action === "confirm_field_team") {
    title = "Confirmed a field team";
  } else if (action === "invite_staff") {
    title = "Invited staff";
  } else if (action === "create_subadmin") {
    title = "Created a sub-admin";
  } else if (action === "approve_agent") {
    title = "Approved an agent";
  } else if (action === "reject_agent") {
    title = "Rejected an agent";
  } else {
    title = action.replaceAll("_", " ");
  }

  const visitDay = metaString(metadata, "visit_day");
  const role = metaString(metadata, "role");
  const detail = visitDay ? `Visit day ${visitDay}` : role ? role.replaceAll("_", " ") : null;
  return { title, detail };
}

/** Calendar day in Lagos, so a page of rows can be read as a log instead of one pile. */
export function activityDayLabel(iso: string | null): string {
  if (!iso) return "Undated";
  return new Date(iso).toLocaleDateString("en-NG", {
    timeZone: "Africa/Lagos",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function activityClock(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-NG", {
    timeZone: "Africa/Lagos",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function groupActivityByDay<T extends { createdAt: string | null }>(
  items: readonly T[],
): Array<{ day: string; items: T[] }> {
  const groups: Array<{ day: string; items: T[] }> = [];
  for (const item of items) {
    const day = activityDayLabel(item.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.items.push(item);
    else groups.push({ day, items: [item] });
  }
  return groups;
}
