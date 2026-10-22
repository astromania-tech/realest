import * as React from "react";
import { Section, Text } from "@react-email/components";
import { EmailLayout } from "../../layouts/EmailLayout";
import { EmailHeader } from "../../components/EmailHeader";
import { EmailFooter } from "../../components/EmailFooter";
import { EmailSection } from "../../components/EmailUI";
import { EmailButton } from "../../components/EmailButton";
import { BASE_URL, colors, fonts, fontSize, spacing } from "../../styles/tokens";
import {
  STAFF_ROLE_CAPABILITIES,
  STAFF_ROLE_LABELS,
  type InvitableStaffRole,
} from "@/lib/auth/staff-invite";

export interface StaffInvitationData {
  email: string;
  full_name: string;
  inviter_name: string;
  reset_link: string;
  role: InvitableStaffRole;
  mode: "created" | "promoted";
}

const styles = {
  heading: {
    fontFamily: fonts.body,
    fontSize: fontSize.lg,
    fontWeight: 700,
    color: colors.brandDark,
    margin: `0 0 ${spacing["3"]}`,
  },
  paragraph: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text,
    lineHeight: "1.6",
    margin: `0 0 ${spacing["5"]}`,
  },
  capability: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: "1.6",
    margin: `0 0 ${spacing["2"]}`,
  },
  fallbackLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    margin: `0 0 ${spacing["2"]}`,
  },
  fallbackLink: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    margin: `0 0 ${spacing["6"]}`,
    wordBreak: "break-all" as const,
  },
  warningSection: {
    backgroundColor: colors.warningBg,
    border: `1px solid ${colors.warningBorder}`,
    padding: `${spacing["4"]} ${spacing["5"]}`,
  },
  warningText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: 600,
    color: colors.warning,
    margin: "0",
    lineHeight: "1.6",
  },
  warningSubText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.text,
    margin: `${spacing["1"]} 0 0`,
    lineHeight: "1.6",
  },
};

export function StaffInvitationEmail({
  full_name,
  inviter_name,
  reset_link,
  role,
  mode,
}: StaffInvitationData) {
  const firstName = full_name?.split(" ")[0] ?? "";
  const roleLabel = STAFF_ROLE_LABELS[role];
  const capabilities = STAFF_ROLE_CAPABILITIES[role];
  const greeting = firstName ? `, ${firstName}` : "";
  const preview =
    mode === "promoted"
      ? `Congratulations — you are invited to continue on RealEST as ${roleLabel}.`
      : `Congratulations — you are invited to join RealEST as ${roleLabel}.`;

  return (
    <EmailLayout preview={preview}>
      <EmailHeader />

      <EmailSection>
        <Text style={styles.heading}>
          Congratulations{greeting} — you&apos;re invited
        </Text>

        <Text style={styles.paragraph}>
          {mode === "promoted" ? (
            <>
              Great news. <strong>{inviter_name}</strong> has invited you to step
              into the <strong>{roleLabel}</strong> role on RealEST verification.
              Welcome to the next chapter of keeping Nigerian listings honest.
            </>
          ) : (
            <>
              Great news. <strong>{inviter_name}</strong> has invited you to join
              RealEST verification as a <strong>{roleLabel}</strong>. We are glad
              to have you on the team that keeps Nigerian listings honest.
            </>
          )}
        </Text>

        <Text style={styles.paragraph}>In this role you will be able to:</Text>

        <Section style={{ marginBottom: spacing["4"] }}>
          {capabilities.map((cap) => (
            <Text key={cap} style={styles.capability}>
              • {cap}
            </Text>
          ))}
        </Section>

        <Text style={styles.paragraph}>
          To get started, set your password and open your staff workspace:
        </Text>

        <Section style={{ textAlign: "center", marginBottom: spacing["6"] }}>
          <EmailButton href={reset_link} variant="primary">
            Set Your Password →
          </EmailButton>
        </Section>

        <Text style={styles.fallbackLabel}>
          If the button doesn&apos;t work, copy this link into your browser:
        </Text>
        <Text style={styles.fallbackLink}>{reset_link}</Text>

        <Section style={styles.warningSection}>
          <Text style={styles.warningText}>This invitation link expires in 24 hours.</Text>
          <Text style={styles.warningSubText}>
            If you didn&apos;t expect this invitation, you can ignore this email.
          </Text>
        </Section>
      </EmailSection>

      <EmailFooter showUnsubscribe={false} />
    </EmailLayout>
  );
}

StaffInvitationEmail.subject = (data: StaffInvitationData) =>
  data.mode === "promoted"
    ? `Congratulations — you're invited as ${STAFF_ROLE_LABELS[data.role]} on RealEST`
    : `You're invited to RealEST as ${STAFF_ROLE_LABELS[data.role]}`;

export const previewProps: StaffInvitationData = {
  email: "chioma@example.ng",
  full_name: "Chioma Adeyemi",
  inviter_name: "RealEST Admin",
  reset_link: `${BASE_URL}/auth/reset?token=preview`,
  role: "team_leader",
  mode: "created",
};

export default StaffInvitationEmail;
