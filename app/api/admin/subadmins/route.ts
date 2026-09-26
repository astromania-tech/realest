import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { getAuthUser } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { logAdminAction } from "@/lib/audit"
import { sendSubAdminInvitationEmail } from "@/lib/emailService"
import { prisma } from "@/lib/prisma"
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata"

export const openApiPOST: OpenApiMetadata = {
  method: 'post',
  summary: 'Create sub-admin account',
  description: 'Invite a new sub-admin by creating a user, profile, and reset link.',
  tags: ['Admin'],
  security: [{ bearerAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['email', 'full_name'],
          properties: {
            email: { type: 'string', format: 'email' },
            full_name: { type: 'string' },
          },
        },
      },
    },
  },
  responses: {
    '200': { description: 'Sub-admin created successfully' },
    '400': { description: 'Missing email or full_name' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Forbidden' },
    '500': { description: 'Failed to create sub-admin' },
  },
}

export async function POST(request: Request) {
  try {
    const { email, full_name } = (await request.json()) as {
      email?: string
      full_name?: string
    }

    if (!email || !full_name) {
      return NextResponse.json({ error: "Missing email or full_name" }, { status: 400 })
    }

    const { data: { user } } = await getAuthUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const adminRow = await prisma.users.findUnique({ where: { id: user.id }, select: { role: true } })
    if (!adminRow || adminRow.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const adminProfile = await prisma.profiles.findUnique({ where: { id: user.id }, select: { full_name: true } })

    const service = createServiceClient()
    const securePassword = randomBytes(32).toString("hex")

    const { data: created, error: adminError } = await service.auth.admin.createUser({
      email,
      password: securePassword,
      email_confirm: true,
      user_metadata: {
        full_name,
        user_type: "admin",
      },
    })

    if (adminError) {
      return NextResponse.json({ error: adminError.message }, { status: 500 })
    }

    const newUserId = created.user?.id
    if (!newUserId) {
      return NextResponse.json({ error: "User creation failed" }, { status: 500 })
    }

    await prisma.users.upsert({
      where: { id: newUserId },
      create: {
        id: newUserId,
        email,
        full_name,
        role: "admin",
      },
      update: {
        email,
        full_name,
        role: "admin",
      },
    })

    await prisma.profiles.upsert({
      where: { id: newUserId },
      create: {
        id: newUserId,
        email,
        full_name,
      },
      update: {
        email,
        full_name,
      },
    })

    const { data: resetData, error: resetError } = await service.auth.admin.generateLink({
      type: "recovery",
      email,
    })

    if (resetError || !resetData.properties?.action_link) {
      return NextResponse.json({ error: "Failed to generate reset link" }, { status: 500 })
    }

    const resetLink = resetData.properties.action_link

    await sendSubAdminInvitationEmail({
      email,
      full_name,
      inviter_name: adminProfile?.full_name ?? "RealEST Admin",
      reset_link: resetLink,
    })

    await logAdminAction({
      actor_id: user.id,
      action: "create_subadmin",
      target_id: newUserId,
      metadata: { email, full_name },
    })

    return NextResponse.json({ success: true, user_id: newUserId })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
