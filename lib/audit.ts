import { prisma } from "@/lib/prisma"
import { Prisma } from "@/lib/prisma/client"

export type AuditAction = 
  | "create_subadmin"
  | "approve_agent"
  | "reject_agent"
  | "delete_property"
  | "update_property_status"
  | "user_moderation"

export interface AuditLogEntry {
  actor_id: string
  action: AuditAction
  target_id?: string | null
  metadata?: Record<string, any> | null
}

/** Normalize optional audit fields to SQL NULL (not JS undefined). */
export function auditLogCreateData(entry: AuditLogEntry) {
  return {
    actor_id: entry.actor_id,
    action: entry.action,
    target_id: entry.target_id ?? null,
    metadata:
      entry.metadata === undefined || entry.metadata === null
        ? Prisma.DbNull
        : (entry.metadata as Prisma.InputJsonValue),
  }
}

export async function logAdminAction(entry: AuditLogEntry) {
  try {
    await prisma.admin_audit_log.create({
      data: auditLogCreateData(entry),
    })
  } catch (err) {
    console.error("[Audit Log Error]", err)
    // Don't throw - we don't want to block operations if audit logging fails
  }
}
