import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { EmailLayout } from '../../layouts/EmailLayout';
import { EmailHeader } from '../../components/EmailHeader';
import { EmailFooter } from '../../components/EmailFooter';
import { EmailSection } from '../../components/EmailUI';
import { BASE_URL, colors, fonts, fontSize, spacing } from '../../styles/tokens';

export interface AdminNotificationData {
  email: string;
  firstName: string;
  lastName?: string;
  position?: number;
  totalCount?: number;
  signupDate?: string;
}

export function AdminNotificationEmail({
  email,
  firstName,
  lastName,
  position,
  totalCount,
  signupDate,
}: AdminNotificationData) {
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  const formattedDate = signupDate
    ? new Date(signupDate).toLocaleString('en-NG', {
        timeZone: 'Africa/Lagos',
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short' });

  return (
    <EmailLayout preview={`New waitlist signup: ${fullName} (${email})`}>
      <EmailHeader />

      <EmailSection>
        {/* Signup details table */}
        <Section style={{
          backgroundColor: colors.brandLight,
          border: `1px solid ${colors.border}`,
          padding: `${spacing['5']} ${spacing['6']}`,
          marginBottom: spacing['6'],
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {([
                ['Name',     fullName || '—'],
                ['Email',    email],
                ['Position', position ? `#${position}` : '—'],
                ['Total signups', totalCount ? `${totalCount} total` : '—'],
                ['Signed up', formattedDate],
              ] as [string, string][]).map(([label, value]) => (
                <tr key={label}>
                  <td style={{
                    padding: `${spacing['3']} 0`,
                    borderBottom: `1px solid ${colors.borderLight}`,
                    fontFamily: fonts.body,
                    fontSize: fontSize.xs,
                    color: colors.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    width: '38%',
                    verticalAlign: 'top',
                  }}>
                    {label}
                  </td>
                  <td style={{
                    padding: `${spacing['3']} 0 ${spacing['3']} ${spacing['4']}`,
                    borderBottom: `1px solid ${colors.borderLight}`,
                    fontFamily: fonts.body,
                    fontSize: fontSize.base,
                    color: colors.text,
                    fontWeight: 500,
                    verticalAlign: 'top',
                  }}>
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Text style={{
          fontFamily: fonts.body,
          fontSize: fontSize.sm,
          color: colors.textMuted,
          margin: '0',
          lineHeight: '1.6',
        }}>
          Manage the waitlist in the{' '}
          <a href={`${BASE_URL}/admin`} style={{ color: colors.brandDark, fontWeight: 600 }}>
            admin dashboard
          </a>
          .
        </Text>
      </EmailSection>

      <EmailFooter showUnsubscribe={false} />
    </EmailLayout>
  );
}

AdminNotificationEmail.subject = (data: AdminNotificationData) =>
  `New waitlist signup: ${data.firstName} ${data.lastName ?? ''} (${data.email})`.trim();

export const previewProps: AdminNotificationData = {
  email: 'adaeze@example.ng',
  firstName: 'Adaeze',
  lastName: 'Okonkwo',
  position: 42,
  totalCount: 312,
  signupDate: new Date().toISOString(),
};

export default AdminNotificationEmail;
