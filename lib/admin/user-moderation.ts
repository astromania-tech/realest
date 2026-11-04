/**
 * Admin user moderation — maps actions onto schema fields that exist.
 * users.is_active = gate. Reason / notes / end_date live on users.metadata.moderation
 * (no dedicated columns) and are also written to admin_audit_log.
 */

import type { Prisma } from "@/lib/prisma/client";

export type ModerationAction = "suspend" | "unsuspend" | "ban" | "unban";

export type UserModerationStatus = "active" | "suspended" | "banned";

export type UserModerationState = {
  status: UserModerationStatus;
  reason: string | null;
  notes: string | null;
  end_date: string | null;
  updated_at: string;
};

/**
 * Next users.is_active value after a moderation action.
 * suspend/ban → false (idempotent if already inactive).
 * unsuspend/unban → true (idempotent if already active).
 */
export function nextIsActive(
  action: ModerationAction,
  currentIsActive: boolean,
): boolean {
  if (action === "unsuspend" || action === "unban") {
    return true;
  }
  if (action === "suspend" || action === "ban") {
    return false;
  }
  return currentIsActive;
}

export function shouldUnlistNonLiveProperties(action: ModerationAction): boolean {
  return action === "suspend" || action === "ban";
}

export function computeSuspensionEndDate(
  action: ModerationAction,
  durationDays: number | undefined,
  nowMs: number = Date.now(),
): string | null {
  if (action !== "suspend" || durationDays == null || !Number.isFinite(durationDays)) {
    return null;
  }
  if (durationDays <= 0) return null;
  return new Date(nowMs + durationDays * 24 * 60 * 60 * 1000).toISOString();
}

export function nextModerationState(params: {
  action: ModerationAction;
  reason: string;
  notes?: string | null;
  durationDays?: number;
  nowMs?: number;
}): UserModerationState {
  const nowMs = params.nowMs ?? Date.now();
  const updated_at = new Date(nowMs).toISOString();
  const notes = params.notes ?? null;

  if (params.action === "suspend") {
    return {
      status: "suspended",
      reason: params.reason,
      notes,
      end_date: computeSuspensionEndDate(params.action, params.durationDays, nowMs),
      updated_at,
    };
  }
  if (params.action === "ban") {
    return {
      status: "banned",
      reason: params.reason,
      notes,
      end_date: null,
      updated_at,
    };
  }
  // unsuspend / unban — clear moderation block; history stays in audit log
  return {
    status: "active",
    reason: null,
    notes: null,
    end_date: null,
    updated_at,
  };
}

export function mergeUserMetadataWithModeration(
  previous: unknown,
  moderation: UserModerationState,
): Prisma.InputJsonValue {
  const base =
    previous && typeof previous === "object" && !Array.isArray(previous)
      ? { ...(previous as Record<string, unknown>) }
      : {};
  return {
    ...base,
    moderation,
  } as Prisma.InputJsonValue;
}

/** True when a temporary suspension end_date is in the past. */
export function isTemporarySuspensionExpired(
  moderation: UserModerationState | null | undefined,
  nowMs: number = Date.now(),
): boolean {
  if (!moderation || moderation.status !== "suspended" || !moderation.end_date) {
    return false;
  }
  const end = Date.parse(moderation.end_date);
  return Number.isFinite(end) && end <= nowMs;
}
