const templates = [
  'WelcomeEmail',
  'SubAdminInvitationEmail',
  'PasswordResetEmail',
  'InquiryNotificationEmail',
  'AdminNotificationEmail',
  'PasswordChangedEmail',
  'OnboardingReminderEmail',
  'WaitlistConfirmationEmail',
];

const { render } = await import('@react-email/render');

for (const t of templates) {
  try {
    const mod = await import(`./emails/templates/${t}.tsx`);
    const Comp = mod[t] ?? mod.default;
    await render(Comp(mod.previewProps));
    console.log('✔ OK   ', t);
  } catch (e) {
    console.error('✖ FAIL ', t, '\n  ', e.message);
  }
}
