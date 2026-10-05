import { Resend } from 'resend';
import {
  renderInvitationEmail,
  renderPasswordResetEmail,
  renderWelcomeEmail,
  InvitationEmailProps,
  PasswordResetEmailProps,
  WelcomeEmailProps,
} from './templates';

// Lazily initialize Resend client
let resendInstance: Resend | null = null;

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export function getDefaultFromEmail(): string {
  // Support custom configured sender address, fallback to onboarding sender
  return (
    process.env.EMAIL_FROM ||
    process.env.RESEND_FROM_EMAIL ||
    'Khutbah Platform <onboarding@resend.dev>'
  );
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
  previewOnly?: boolean;
}

/**
 * Low-level email sender wrapping Resend SDK with development fallback
 */
export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}): Promise<SendEmailResult> {
  const resend = getResendClient();
  const from = params.from || getDefaultFromEmail();
  const recipient = Array.isArray(params.to) ? params.to.join(', ') : params.to;

  if (!resend) {
    console.warn(
      `\n⚠️ [Email Service: Development Mode - RESEND_API_KEY not configured]` +
      `\nTo: ${recipient}` +
      `\nFrom: ${from}` +
      `\nSubject: ${params.subject}` +
      `\n--- Content Preview ---` +
      `\n${params.text || params.html.substring(0, 300)}...` +
      `\n------------------------\n`
    );

    return {
      success: true,
      id: `dev-mock-${Date.now()}`,
      previewOnly: true,
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    if (error) {
      console.error('[Email Service] Resend dispatch error:', error);
      return {
        success: false,
        error: error.message || 'Failed to dispatch email via Resend',
      };
    }

    return {
      success: true,
      id: data?.id,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error dispatching email';
    console.error('[Email Service] Exception during dispatch:', message);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Send an invitation email to a newly invited user or admin
 */
export async function sendInvitationEmail(
  props: InvitationEmailProps
): Promise<SendEmailResult> {
  const { html, text, subject } = renderInvitationEmail(props);
  return await sendEmail({
    to: props.recipientEmail,
    subject,
    html,
    text,
  });
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(
  props: PasswordResetEmailProps
): Promise<SendEmailResult> {
  const { html, text, subject } = renderPasswordResetEmail(props);
  return await sendEmail({
    to: props.recipientEmail,
    subject,
    html,
    text,
  });
}

/**
 * Send a welcome email after account activation
 */
export async function sendWelcomeEmail(
  props: WelcomeEmailProps
): Promise<SendEmailResult> {
  const { html, text, subject } = renderWelcomeEmail(props);
  return await sendEmail({
    to: props.recipientEmail,
    subject,
    html,
    text,
  });
}

export * from './templates';
