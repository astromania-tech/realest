import { prisma } from "@/lib/prisma";

export type StaffNotifyInput = {
  userId: string;
  type: string;
  title: string;
  message: string;
  href?: string;
  propertyId?: string;
};

export async function notifyStaff(input: StaffNotifyInput): Promise<void> {
  await prisma.notifications.create({
    data: {
      user_id: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      data: {
        href: input.href ?? null,
        property_id: input.propertyId ?? null,
      },
    },
  });
}

export async function notifyStaffMany(inputs: StaffNotifyInput[]): Promise<void> {
  if (inputs.length === 0) return;
  await prisma.notifications.createMany({
    data: inputs.map((input) => ({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      data: {
        href: input.href ?? null,
        property_id: input.propertyId ?? null,
      },
    })),
  });
}
