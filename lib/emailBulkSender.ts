/**
 * RealEST Email Bulk Sender
 *
 * Two sending modes:
 *  1. broadcast  — Resend Broadcasts API (for Resend-managed audiences).
 *                  One API call creates + sends to the full audience.
 *                  Resend handles unsubscribes natively.
 *
 *  2. batch      — Resend Batch API (for DB-segment sends).
 *                  Recipients are fetched from the database, emails are
 *                  rendered once (or per-recipient when personalization is
 *                  needed), then sent in chunks of MAX_BATCH_SIZE with a
 *                  BATCH_DELAY_MS gap to honour Resend's 2 req/sec limit.
 */

import * as React from 'react';
import { Resend } from 'resend';
import { renderEmailFull } from '@/emails';
import { interpolateSubject } from '@/lib/utils/interpolateSubject';

// ── Config ────────────────────────────────────────────────────────────────────
/** Max emails per Resend batch request (Resend hard limit is 100). */
const MAX_BATCH_SIZE = 100;
/** Milliseconds to wait between consecutive batch requests (≈ 1.8 req/sec). */
const BATCH_DELAY_MS = 550;

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CampaignRecipient {
  email: string;
  firstName?: string;
  fullName?: string;
  /** Per-recipient unique referral code (e.g. "A3F9B2C1") */
  referralCode?: string;
  /** Full referral landing URL, e.g. https://realest.ng/refer?ref=A3F9B2C1 */
  referralUrl?: string;
}

export interface BroadcastSendOptions {
  mode: 'broadcast';
  audience_id: string;
  from: string;
  subject: string;
  /** Pre-rendered HTML string */
  html: string;
  /** Pre-rendered plain-text string */
  text: string;
  /** Human-readable broadcast name (shows in Resend dashboard) */
  name?: string;
}

export interface BatchSendOptions {
  mode: 'batch';
  recipients: CampaignRecipient[];
  from: string;
  subject: string;
  /**
   * Per-recipient render function. When provided, called for each recipient so
   * each email is personalised (firstName, email, etc. can vary per person).
   * Takes precedence over html/text.
   */
  renderFn?: (recipient: CampaignRecipient) => Promise<{ html: string; text: string }>;
  /** Pre-rendered HTML — used when renderFn is not provided (same for all recipients) */
  html?: string;
  /** Pre-rendered plain-text — used when renderFn is not provided */
  text?: string;
  /** Called after each chunk with running totals for progress tracking */
  onProgress?: (sent: number, failed: number, total: number) => void;
}

export type BulkSendOptions = BroadcastSendOptions | BatchSendOptions;

export interface BulkSendResult {
  success: boolean;
  sent: number;
  failed: number;
  /** Resend broadcast ID (broadcast mode) or first batch message ID (batch mode) */
  resendId?: string;
  error?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ── Render helper ─────────────────────────────────────────────────────────────

/**
 * Render a named email template with the provided props.
 * The component is imported lazily so unused templates don't bloat the bundle.
 * Returns { html, text } ready for the Resend API.
 */
export async function renderCampaignTemplate(
  templateName: string,
  props: Record<string, unknown>,
): Promise<{ html: string; text: string }> {
  // Dynamic import ensures tree-shaking and avoids circular deps at module load.
  const emailModule = await import('@/emails');
  const Component = (emailModule as Record<string, unknown>)[templateName] as
    | React.ComponentType<Record<string, unknown>>
    | undefined;

  if (!Component) {
    throw new Error(`Email template "${templateName}" not found in @/emails barrel.`);
  }

  return renderEmailFull(React.createElement(Component, props));
}

// ── Broadcast mode ────────────────────────────────────────────────────────────

async function sendBroadcast(opts: BroadcastSendOptions): Promise<BulkSendResult> {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, sent: 0, failed: 0, error: 'RESEND_API_KEY not configured' };
  }

  try {
    // 1. Create the broadcast
    const createRes = await (resend.broadcasts as unknown as {
      create: (body: {
        audience_id: string;
        from: string;
        name: string;
        subject: string;
        html: string;
        text: string;
      }) => Promise<{ data: { id: string } | null; error: { message: string } | null }>;
    }).create({
      audience_id: opts.audience_id,
      from: opts.from,
      name: opts.name ?? `Campaign ${new Date().toISOString()}`,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });

    if (createRes.error || !createRes.data?.id) {
      console.error('❌ Broadcast create error:', createRes.error);
      return {
        success: false,
        sent: 0,
        failed: 0,
        error: createRes.error?.message ?? 'Failed to create broadcast',
      };
    }

    const broadcastId = createRes.data.id;

    // 2. Send the broadcast
    const sendRes = await (resend.broadcasts as unknown as {
      send: (broadcastId: string) => Promise<{ data: unknown; error: { message: string } | null }>;
    }).send(broadcastId);

    if (sendRes.error) {
      console.error('❌ Broadcast send error:', sendRes.error);
      return {
        success: false,
        sent: 0,
        failed: 0,
        resendId: broadcastId,
        error: sendRes.error.message,
      };
    }

    console.log(`✅ Broadcast sent: ${broadcastId}`);
    return { success: true, sent: 1, failed: 0, resendId: broadcastId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Broadcast exception:', err);
    return { success: false, sent: 0, failed: 0, error: msg };
  }
}

// ── Batch mode ────────────────────────────────────────────────────────────────

async function sendBatch(opts: BatchSendOptions): Promise<BulkSendResult> {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, sent: 0, failed: 0, error: 'RESEND_API_KEY not configured' };
  }
  if (!opts.recipients.length) {
    return { success: true, sent: 0, failed: 0 };
  }

  let totalSent = 0;
  let totalFailed = 0;
  let firstMessageId: string | undefined;

  // Filter out recipients with missing, blank, or malformed email addresses.
  // Resend rejects the entire batch chunk if any single `to` value is invalid.
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validRecipients = opts.recipients.filter(
    (r) => typeof r.email === 'string' && EMAIL_RE.test(r.email.trim()),
  );
  if (validRecipients.length !== opts.recipients.length) {
    console.warn(
      `⚠️ Skipped ${opts.recipients.length - validRecipients.length} recipients with invalid/missing emails`,
    );
  }

  const chunks = chunk(validRecipients, MAX_BATCH_SIZE);
  console.log(
    `📤 Batch send: ${validRecipients.length} recipients in ${chunks.length} chunk(s)`,
  );

  for (let i = 0; i < chunks.length; i++) {
    const currentChunk = chunks[i];

    const emails = await Promise.all(
      currentChunk.map(async (recipient) => {
        const { html, text } = opts.renderFn
          ? await opts.renderFn(recipient)
          : { html: opts.html ?? '', text: opts.text ?? '' };
        return {
          from: opts.from,
          to: recipient.email,
          subject: interpolateSubject(opts.subject, {
            firstName: recipient.firstName,
            fullName: recipient.fullName,
            email: recipient.email,
          }),
          html,
          text,
        };
      }),
    );

    try {
      const batchRes = await resend.batch.send(emails as Parameters<typeof resend.batch.send>[0]);

      if (batchRes.error) {
        console.error(`❌ Batch chunk ${i + 1} error:`, batchRes.error);
        totalFailed += currentChunk.length;
      } else {
        const chunkSent = currentChunk.length;
        totalSent += chunkSent;
        if (!firstMessageId && Array.isArray(batchRes.data) && batchRes.data[0]) {
          firstMessageId = (batchRes.data[0] as { id?: string }).id;
        }
      }
    } catch (err) {
      console.error(`❌ Batch chunk ${i + 1} exception:`, err);
      totalFailed += currentChunk.length;
    }

    opts.onProgress?.(totalSent, totalFailed, opts.recipients.length);

    // Rate-limit gap — skip after last chunk
    if (i < chunks.length - 1) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  console.log(`✅ Batch complete: ${totalSent} sent, ${totalFailed} failed`);
  return {
    success: totalFailed === 0,
    sent: totalSent,
    failed: totalFailed,
    resendId: firstMessageId,
  };
}

// ── Main dispatcher ───────────────────────────────────────────────────────────

export async function executeBulkSend(opts: BulkSendOptions): Promise<BulkSendResult> {
  if (opts.mode === 'broadcast') {
    return sendBroadcast(opts);
  }
  return sendBatch(opts);
}
