import * as React from 'react';
import { Section, Text, Link } from '@react-email/components';
import { EmailLayout } from '../../layouts/EmailLayout';
import { EmailHeader } from '../../components/EmailHeader';
import { EmailFooter } from '../../components/EmailFooter';
import { EmailSection } from '../../components/EmailUI';
import { EmailButton } from '../../components/EmailButton';
import { BASE_URL, colors, fonts, fontSize, spacing } from '../../styles/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────
export type SystemUpdateSeverity = 'info' | 'warning' | 'maintenance';

export interface SystemUpdateEmailData {
  /** Short headline, e.g. "Scheduled Maintenance" */
  title: string;
  /** ISO date-time string for when the maintenance/update starts */
  scheduledAt?: string;
  /** Duration string e.g. "approximately 2 hours" */
  duration?: string;
  /** What systems are affected */
  affectedSystems?: string[];
  /** Why it is happening */
  reason?: string;
  /** User impact in plain language */
  impact?: string;
  severity?: SystemUpdateSeverity;
  statusPageUrl?: string;
}

// ─── Severity config ──────────────────────────────────────────────────────────
const SEVERITY_CONFIG: Record<SystemUpdateSeverity, {
  label: string;
  labelColor: string;
  labelBg: string;
  iconColor: string;
}> = {
  info: {
    label: 'System Update',
    labelColor: colors.info,
    labelBg: colors.infoBg,
    iconColor: colors.info,
  },
  warning: {
    label: 'Action Required',
    labelColor: colors.warning,
    labelBg: colors.warningBg,
    iconColor: colors.warning,
  },
  maintenance: {
    label: 'Scheduled Maintenance',
    labelColor: colors.brandDark,
    labelBg: colors.pageBg,
    iconColor: colors.brandDark,
  },
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  heroBg: {
    backgroundColor: colors.brandDark,
    padding: `${spacing['10']} ${spacing['8']}`,
    textAlign: 'center' as const,
  },
  heroLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: 700 as const,
    color: colors.brandAccent,
    letterSpacing: '0.22em',
    textTransform: 'uppercase' as const,
    margin: `0 0 ${spacing['3']}`,
  },
  heroTitle: {
    fontFamily: fonts.body,
    fontSize: fontSize['2xl'],
    fontWeight: 700 as const,
    color: colors.brandLight,
    lineHeight: '1.2',
    margin: `0`,
  },
  paragraph: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text,
    lineHeight: '1.65',
    margin: `0 0 ${spacing['5']}`,
  },
  detailRow: {
    paddingBottom: spacing['3'],
    borderBottom: `1px solid ${colors.borderLight}`,
    marginBottom: spacing['3'],
  },
  detailLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    fontWeight: 700 as const,
    margin: `0 0 ${spacing['1']}`,
  },
  detailValue: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text,
    margin: 0,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function SystemUpdateEmail({
  title = 'System Update',
  scheduledAt = '',
  duration = '',
  affectedSystems = [],
  reason = '',
  impact = '',
  severity = 'maintenance',
  statusPageUrl = '',
}: SystemUpdateEmailData) {
  const cfg = SEVERITY_CONFIG[severity];
  const ctaUrl = statusPageUrl || `${BASE_URL}/status`;
  const formattedDate = scheduledAt
    ? new Date(scheduledAt).toLocaleString('en-NG', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
      })
    : null;

  return (
    <EmailLayout preview={`RealEST — ${title}`}>
      <EmailHeader />

      {/* Dark hero with dynamic severity label */}
      <Section style={s.heroBg}>
        <Text style={s.heroLabel}>{cfg.label}</Text>
        <Text style={s.heroTitle}>{title}</Text>
      </Section>

      <EmailSection>
        {/* Summary card */}
        <Section style={{
          border: `1px solid ${colors.border}`,
          padding: `${spacing['5']} ${spacing['6']}`,
          marginBottom: spacing['6'],
        }}>
          {formattedDate && (
            <div style={s.detailRow}>
              <p style={s.detailLabel}>Scheduled for</p>
              <p style={s.detailValue}>{formattedDate}</p>
            </div>
          )}

          {duration && (
            <div style={s.detailRow}>
              <p style={s.detailLabel}>Expected duration</p>
              <p style={s.detailValue}>{duration}</p>
            </div>
          )}

          {affectedSystems.length > 0 && (
            <div style={{ ...s.detailRow, borderBottom: 'none', marginBottom: 0 }}>
              <p style={s.detailLabel}>Affected systems</p>
              <p style={s.detailValue}>{affectedSystems.join(', ')}</p>
            </div>
          )}
        </Section>

        {/* Why */}
        {reason && (
          <>
            <Text style={{
              fontFamily: fonts.body,
              fontSize: fontSize.sm,
              fontWeight: 700 as const,
              color: colors.text,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.1em',
              margin: `0 0 ${spacing['2']}`,
            }}>
              Why this is happening
            </Text>
            <Text style={s.paragraph}>{reason}</Text>
          </>
        )}

        {/* Impact */}
        {impact && (
          <>
            <Text style={{
              fontFamily: fonts.body,
              fontSize: fontSize.sm,
              fontWeight: 700 as const,
              color: colors.text,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.1em',
              margin: `0 0 ${spacing['2']}`,
            }}>
              Impact on you
            </Text>
            <Text style={s.paragraph}>{impact}</Text>
          </>
        )}

        <Text style={{ ...s.paragraph, color: colors.textMuted, fontSize: fontSize.sm }}>
          Your data is safe and unaffected. We apologise for any inconvenience and will keep
          the status page updated throughout the window.
        </Text>

        <EmailButton href={ctaUrl} variant="secondary">
          Check System Status →
        </EmailButton>
      </EmailSection>

      <EmailFooter showUnsubscribe={false} />
    </EmailLayout>
  );
}

SystemUpdateEmail.subject = (data: SystemUpdateEmailData) =>
  `RealEST System Notice: ${data.title}`;

export default SystemUpdateEmail;

export const previewProps: SystemUpdateEmailData = {
  title: 'Scheduled Database Maintenance',
  scheduledAt: '2026-04-15T02:00:00+01:00',
  duration: 'approximately 2 hours',
  affectedSystems: ['Property Search', 'Listing Submissions', 'Inquiry Messaging'],
  reason: 'We are upgrading our Supabase infrastructure to handle the 10,000+ users on the waitlist and ensure zero data loss at launch.',
  impact: 'The platform will be in read-only mode during the window. You will be able to browse properties but cannot submit new listings or send inquiries.',
  severity: 'maintenance',
  statusPageUrl: 'https://status.realest.ng',
};
