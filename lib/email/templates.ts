/**
 * Email templates for Khutbah Platform
 * Features clean, responsive, inline-styled HTML templates matching Khutbah Malawi's branding.
 */

export interface InvitationEmailProps {
  recipientEmail: string;
  inviterName: string;
  role: 'admin' | 'listener';
  permissions?: string[];
  inviteUrl: string;
  message?: string | null;
  expiresAt: Date;
}

export interface PasswordResetEmailProps {
  recipientEmail: string;
  userName?: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

export interface WelcomeEmailProps {
  recipientEmail: string;
  userName: string;
  role: string;
  loginUrl: string;
}

/**
 * Base layout wrapper for Khutbah emails
 */
function emailLayout(content: string, previewText: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Khutbah Platform</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #DADAD4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #171717;">
  <!-- Preview Text -->
  <div style="display: none; font-size: 1px; color: #DADAD4; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${previewText}
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #DADAD4; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Container Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #F8F8F5; border-radius: 20px; border: 1px solid rgba(23, 23, 23, 0.08); box-shadow: 0 4px 20px rgba(0,0,0,0.04); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 36px 40px 24px 40px; border-bottom: 1px solid rgba(23, 23, 23, 0.06); text-align: center;">
              <div style="display: inline-block; padding: 8px 14px; background-color: #171717; border-radius: 12px; margin-bottom: 14px;">
                <span style="color: #FF713F; font-size: 18px; font-weight: bold; letter-spacing: -0.5px;">✦</span>
                <span style="color: #FFFFFF; font-size: 15px; font-weight: 700; letter-spacing: 0.5px; margin-left: 6px;">KHUTBAH</span>
              </div>
              <p style="margin: 0; color: #73736C; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">
                Islamic Media Platform • Malawi
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 40px 40px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 32px 40px; background-color: #EEEEEC; border-top: 1px solid rgba(23, 23, 23, 0.06); text-align: center;">
              <p style="margin: 0 0 8px 0; color: #73736C; font-size: 12px; line-height: 18px;">
                Khutbah Malawi • Curated Sermons, Reminders & Authentic Teachings
              </p>
              <p style="margin: 0; color: #A0A09B; font-size: 11px;">
                This is an automated administrative notification. Please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Render HTML & text for invitation email
 */
export function renderInvitationEmail(props: InvitationEmailProps): { html: string; text: string; subject: string } {
  const isRoleAdmin = props.role === 'admin';
  const roleDisplay = isRoleAdmin ? 'Platform Administrator' : 'Listener Account';
  const formattedExpiry = new Date(props.expiresAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const permissionsListHtml =
    isRoleAdmin && props.permissions && props.permissions.length > 0
      ? `
      <div style="margin: 20px 0; padding: 16px; background-color: #FFFFFF; border-radius: 12px; border: 1px solid rgba(23, 23, 23, 0.06);">
        <p style="margin: 0 0 10px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #73736C;">
          Assigned Authority & Permissions (${props.permissions.length}):
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${props.permissions
            .map(
              (perm) =>
                `<span style="display: inline-block; background-color: #F1F1EC; color: #171717; font-family: monospace; font-size: 11px; padding: 4px 8px; border-radius: 6px; margin: 2px 4px 2px 0;">${perm}</span>`
            )
            .join('')}
        </div>
      </div>
      `
      : '';

  const personalMessageHtml = props.message
    ? `
      <div style="margin: 20px 0; padding: 16px 20px; background-color: #FFFFFF; border-left: 3px solid #FF713F; border-radius: 8px; font-style: italic; color: #55554F; font-size: 13px; line-height: 20px;">
        &ldquo;${props.message}&rdquo;
      </div>
      `
    : '';

  const content = `
    <h1 style="margin: 0 0 16px 0; color: #171717; font-size: 24px; font-weight: 600; line-height: 30px;">
      You're invited to join Khutbah
    </h1>
    
    <p style="margin: 0 0 16px 0; color: #40403C; font-size: 14px; line-height: 22px;">
      Hello,
    </p>

    <p style="margin: 0 0 20px 0; color: #40403C; font-size: 14px; line-height: 22px;">
      <strong style="color: #171717;">${props.inviterName}</strong> has invited you to join the <strong>Khutbah Malawi Islamic Media Platform</strong> as a <span style="background-color: #171717; color: #FFFFFF; padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;">${roleDisplay}</span>.
    </p>

    ${personalMessageHtml}
    ${permissionsListHtml}

    <p style="margin: 0 0 28px 0; color: #55554F; font-size: 13px; line-height: 20px;">
      Click the button below to accept your invitation, verify your credentials, and activate your access:
    </p>

    <!-- Call to Action Button -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 32px 0;">
      <tr>
        <td align="center">
          <a href="${props.inviteUrl}" target="_blank" style="display: inline-block; background-color: #171717; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); letter-spacing: 0.2px;">
            Accept Invitation &amp; Set Up Account &rarr;
          </a>
        </td>
      </tr>
    </table>

    <div style="padding: 16px; background-color: #FAF8F2; border-radius: 10px; border: 1px solid rgba(214, 168, 46, 0.25); margin-bottom: 24px;">
      <p style="margin: 0; color: #8C6D1F; font-size: 12px; line-height: 18px;">
        ⏳ <strong>Expiration notice:</strong> This invitation link is cryptographically signed and will expire on <strong>${formattedExpiry}</strong>.
      </p>
    </div>

    <p style="margin: 0; color: #73736C; font-size: 11px; line-height: 16px; word-break: break-all;">
      If the button above does not work, copy and paste this link into your browser:<br>
      <a href="${props.inviteUrl}" style="color: #FF713F; text-decoration: underline;">${props.inviteUrl}</a>
    </p>
  `;

  const subject = `You've been invited to join Khutbah Malawi (${roleDisplay})`;
  const preview = `${props.inviterName} invited you to collaborate on Khutbah Malawi as ${roleDisplay}.`;

  const text = `
You've been invited to join Khutbah Malawi

Hello,

${props.inviterName} has invited you to join the Khutbah Malawi Islamic Media Platform as a ${roleDisplay}.

${props.message ? `Message from ${props.inviterName}: "${props.message}"\n\n` : ''}
${props.permissions && props.permissions.length > 0 ? `Assigned Permissions: ${props.permissions.join(', ')}\n\n` : ''}

To accept your invitation and activate your account, please open the following link:
${props.inviteUrl}

This invitation will expire on ${formattedExpiry}.

Khutbah Malawi • Curated Sermons & Authentic Teachings
  `.trim();

  return {
    html: emailLayout(content, preview),
    text,
    subject,
  };
}

/**
 * Render HTML & text for password reset email
 */
export function renderPasswordResetEmail(props: PasswordResetEmailProps): { html: string; text: string; subject: string } {
  const expiryText = props.expiresInMinutes ? `${props.expiresInMinutes} minutes` : '60 minutes';

  const content = `
    <h1 style="margin: 0 0 16px 0; color: #171717; font-size: 24px; font-weight: 600; line-height: 30px;">
      Reset your password
    </h1>
    
    <p style="margin: 0 0 16px 0; color: #40403C; font-size: 14px; line-height: 22px;">
      ${props.userName ? `Hello <strong>${props.userName}</strong>,` : 'Hello,'}
    </p>

    <p style="margin: 0 0 20px 0; color: #40403C; font-size: 14px; line-height: 22px;">
      We received a request to reset the password for your account associated with <strong style="color: #171717;">${props.recipientEmail}</strong> on the Khutbah Platform.
    </p>

    <p style="margin: 0 0 28px 0; color: #55554F; font-size: 13px; line-height: 20px;">
      Click the button below to choose a new password:
    </p>

    <!-- Call to Action Button -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 32px 0;">
      <tr>
        <td align="center">
          <a href="${props.resetUrl}" target="_blank" style="display: inline-block; background-color: #171717; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); letter-spacing: 0.2px;">
            Reset Account Password &rarr;
          </a>
        </td>
      </tr>
    </table>

    <div style="padding: 16px; background-color: #FFF9F7; border-radius: 10px; border: 1px solid rgba(255, 113, 63, 0.25); margin-bottom: 24px;">
      <p style="margin: 0 0 6px 0; color: #C4461B; font-size: 12px; font-weight: 600;">
        🛡️ Security Information:
      </p>
      <p style="margin: 0; color: #6E544C; font-size: 12px; line-height: 18px;">
        This password reset link is valid for <strong>${expiryText}</strong>. If you did not request this password reset, please disregard this email. Your current credentials remain safe and unaffected.
      </p>
    </div>

    <p style="margin: 0; color: #73736C; font-size: 11px; line-height: 16px; word-break: break-all;">
      If the button above does not work, copy and paste this link into your browser:<br>
      <a href="${props.resetUrl}" style="color: #FF713F; text-decoration: underline;">${props.resetUrl}</a>
    </p>
  `;

  const subject = `Reset your Khutbah Platform password`;
  const preview = `Password reset request for your Khutbah account (${props.recipientEmail}).`;

  const text = `
Reset your Khutbah Platform password

${props.userName ? `Hello ${props.userName},` : 'Hello,'}

We received a request to reset the password for your account associated with ${props.recipientEmail}.

To reset your password, please open the following secure link:
${props.resetUrl}

This link will expire in ${expiryText}.

If you did not request a password reset, please ignore this email. Your account remains secure.

Khutbah Malawi • Islamic Media Platform
  `.trim();

  return {
    html: emailLayout(content, preview),
    text,
    subject,
  };
}

/**
 * Render HTML & text for welcome / account activation email
 */
export function renderWelcomeEmail(props: WelcomeEmailProps): { html: string; text: string; subject: string } {
  const content = `
    <h1 style="margin: 0 0 16px 0; color: #171717; font-size: 24px; font-weight: 600; line-height: 30px;">
      Welcome to Khutbah Malawi!
    </h1>
    
    <p style="margin: 0 0 16px 0; color: #40403C; font-size: 14px; line-height: 22px;">
      Assalamu alaikum <strong>${props.userName}</strong>,
    </p>

    <p style="margin: 0 0 20px 0; color: #40403C; font-size: 14px; line-height: 22px;">
      Your account on the <strong>Khutbah Malawi Islamic Media Platform</strong> has been successfully activated as <strong>${props.role}</strong>.
    </p>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0 32px 0;">
      <tr>
        <td align="center">
          <a href="${props.loginUrl}" target="_blank" style="display: inline-block; background-color: #171717; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
            Access Platform &rarr;
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 0; color: #55554F; font-size: 12px; line-height: 18px;">
      May this platform be a source of benefit, knowledge, and barakah for the community.
    </p>
  `;

  const subject = `Welcome to Khutbah Malawi Platform`;
  const preview = `Your account on Khutbah Malawi has been activated.`;

  const text = `
Welcome to Khutbah Malawi!

Assalamu alaikum ${props.userName},

Your account on the Khutbah Malawi Islamic Media Platform has been successfully activated as ${props.role}.

You can log in here:
${props.loginUrl}

Khutbah Malawi • Islamic Media Platform
  `.trim();

  return {
    html: emailLayout(content, preview),
    text,
    subject,
  };
}
