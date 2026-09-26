import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { getAuthUser } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { logAdminAction } from "@/lib/audit"
import { sendSubAdminInvitationEmail } from "@/lib/emailService"
import { prisma } from "@/lib/prisma"
import { createWithAuthDbCompensate } from "@/lib/auth/auth-db-compensate"
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

export async function persistSubAdminRecords(params: {
  userId: string
  email: string
  fullName: string
}) {
  const { userId, email, fullName } = params
  await prisma.$transaction([
    prisma.users.upsert({
      where: { id: userId },
      create: {
        id: userId,
        email,
        full_name: fullName,
        role: "admin",
      },
      update: {
        email,
        full_name: fullName,
        role: "admin",
      },
    }),
    prisma.profiles.upsert({
      where: { id: userId },
      create: {
        id: userId,
        email,
        full_name: fullName,
      },
      update: {
        email,
        full_name: fullName,
      },
    }),
  ])
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

    const provisioned = await createWithAuthDbCompensate({
      createAuthUser: async () => {
        const { data: created, error: adminError } = await service.auth.admin.createUser({
          email,
          password: securePassword,
          email_confirm: true,
          user_metadata: {
            full_name,
            user_type: "admin",
          },
        })
        if (adminError) throw new Error(adminError.message)
        const id = created.user?.id
        if (!id) throw new Error("User creation failed")
        return { userId: id }
      },
      persistDb: async (userId) => {
        await persistSubAdminRecords({
          userId,
          email,
          fullName: full_name,
        })
      },
      deleteAuthUser: async (userId) => {
        const { error: deleteError } = await service.auth.admin.deleteUser(userId)
        if (deleteError) {
          console.error("[subadmins] Auth rollback deleteUser failed:", deleteError)
          throw deleteError
        }
      },
    })

    if (!provisioned.ok) {
      const message =
        provisioned.error === "auth_create_failed"
          ? "Failed to create sub-admin auth user"
          : "Failed to create sub-admin database records"
      return NextResponse.json({ error: message }, { status: 500 })
    }

    const newUserId = provisioned.userId

    const { data: resetData, error: resetError } = await service.auth.admin.generateLink({
      type: "recovery",
      email,
    })

    if (resetError || !resetData.properties?.action_link) {
      // Auth + DB are consistent; do not delete. Admin can resend invite.
      return NextResponse.json({ error: "Failed to generate reset link" }, { status: 500 })
    }

    await sendSubAdminInvitationEmail({
      email,
      full_name,
      inviter_name: adminProfile?.full_name ?? "RealEST Admin",
      reset_link: resetData.properties.action_link,
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
