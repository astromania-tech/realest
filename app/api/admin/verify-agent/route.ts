import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { logAdminAction } from "@/lib/audit"
import { prisma } from "@/lib/prisma"
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata"

export const openApiPOST: OpenApiMetadata = {
  method: 'post',
  summary: 'Verify or reject an agent',
  description: 'Admin action that approves or rejects an agent account.',
  tags: ['Admin'],
  security: [{ bearerAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['agentId', 'action'],
          properties: {
            agentId: { type: 'string' },
            action: { type: 'string', enum: ['approve', 'reject'] },
            notes: { type: 'string' },
          },
        },
      },
    },
  },
  responses: {
    '200': { description: 'Agent verification updated successfully' },
    '400': { description: 'Missing agentId or action' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Forbidden' },
    '500': { description: 'Internal server error' },
  },
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { agentId, action, notes } = body as { agentId?: string, action?: "approve" | "reject", notes?: string }
    if (!agentId || !action) {
      return NextResponse.json({ error: "Missing agentId or action" }, { status: 400 })
    }

    const { data: { user } } = await getAuthUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const adminRow = await prisma.users.findUnique({ where: { id: user.id }, select: { role: true } })
    if (!adminRow || adminRow.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.agents.update({
      where: { id: agentId },
      data: {
        verified: action === 'approve',
        verification_date: action === 'approve' ? new Date() : null,
      },
    })

    await logAdminAction({
      actor_id: user.id,
      action: action === "approve" ? "approve_agent" : "reject_agent",
      target_id: agentId,
      metadata: { notes },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
