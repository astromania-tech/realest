/**
 * Email render utilities
 *
 * Wraps @react-email/render so the rest of the codebase imports from
 * one place. If the React Email API ever changes, update here only.
 */
import { render } from '@react-email/render';
import type * as React from 'react';

/**
 * Render a React Email component to an HTML string.
 *
 * @param component - React element (e.g. `<WelcomeEmail {...props} />`)
 * @returns Fully rendered HTML string safe to pass to Resend's `html:` field
 */
export async function renderEmail(component: React.ReactElement): Promise<string> {
  return render(component, { pretty: false });
}

/**
 * Render to plain text — useful for Resend's `text:` field.
 */
export async function renderEmailText(component: React.ReactElement): Promise<string> {
  return render(component, { plainText: true });
}

/**
 * Render both html + text in one call.
 */
export async function renderEmailFull(component: React.ReactElement): Promise<{
  html: string;
  text: string;
}> {
  const [html, text] = await Promise.all([
    render(component, { pretty: false }),
    render(component, { plainText: true }),
  ]);
  return { html, text };
}
