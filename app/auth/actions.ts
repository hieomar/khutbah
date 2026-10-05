'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { auth } from '../../lib/auth/auth';
import {
  getInvitationByToken,
  acceptInvitation,
  getUserById,
  getUserByEmail,
  setUserPermissions,
} from '../../lib/db/store';
import { recordAuditEvent } from '../../lib/audit';
import { sendWelcomeEmail } from '../../lib/email';
import { db } from '../../lib/db';
import * as schema from '../../lib/db/schema';
import { eq } from 'drizzle-orm';

const RequestResetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

const AcceptInviteSchema = z.object({
  token: z.string().min(1, 'Invitation token is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export interface InvitationDetailsResult {
  success: boolean;
  error?: string;
  invitation?: {
    email: string;
    role: 'admin' | 'listener';
    permissions: string[];
    inviterName: string;
    expiresAt: Date;
    message?: string | null;
  };
}

/**
 * Validates an invitation token and returns safe metadata for displaying to the user
 */
export async function getInvitationDetailsAction(
  token: string
): Promise<InvitationDetailsResult> {
  try {
    if (!token) {
      return { success: false, error: 'Invitation token is missing.' };
    }

    const inv = await getInvitationByToken(token);
    if (!inv) {
      return { success: false, error: 'Invitation token is invalid or not found.' };
    }

    if (inv.status === 'accepted') {
      return { success: false, error: 'This invitation has already been accepted.' };
    }

    if (inv.status === 'revoked') {
      return { success: false, error: 'This invitation has been revoked by an administrator.' };
    }

    if (new Date() > new Date(inv.expiresAt) || inv.status === 'expired') {
      return { success: false, error: 'This invitation has expired. Please contact an administrator for a new invite.' };
    }

    // Lookup inviter's name
    const inviter = await getUserById(inv.invitedBy);
    const inviterName = inviter ? inviter.name : 'Platform Administrator';

    return {
      success: true,
      invitation: {
        email: inv.email,
        role: inv.role,
        permissions: inv.permissions,
        inviterName,
        expiresAt: inv.expiresAt,
        message: inv.message,
      },
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to retrieve invitation details';
    return { success: false, error: msg };
  }
}

/**
 * Accepts an invitation: sets up the user account with chosen name and password,
 * assigns permissions, marks invitation accepted, and sends welcome email.
 */
export async function acceptInvitationAction(formData: unknown) {
  try {
    const parsed = AcceptInviteSchema.parse(formData);
    const inv = await getInvitationByToken(parsed.token);

    if (!inv) {
      return { success: false, error: 'Invitation not found or invalid' };
    }

    if (inv.status !== 'pending') {
      return { success: false, error: `This invitation is already ${inv.status}.` };
    }

    if (new Date() > new Date(inv.expiresAt)) {
      return { success: false, error: 'This invitation has expired.' };
    }

    const reqHeaders = await headers();

    // Check if account already exists in Better Auth
    const existingUser = await getUserByEmail(inv.email);
    let userId = existingUser?.id;

    if (!existingUser) {
      // Create user via Better Auth
      const signupRes = await auth.api.signUpEmail({
        body: {
          email: inv.email,
          password: parsed.password,
          name: parsed.name,
        },
        headers: reqHeaders,
      });

      if (signupRes?.user?.id) {
        userId = signupRes.user.id;
      }
    }

    // Now complete store level invitation acceptance and role/permission assignment
    const { user: updatedUser } = await acceptInvitation(parsed.token, {
      name: parsed.name,
      userId,
    });

    // Ensure role and permissions are correctly updated on the user record
    await db
      .update(schema.user)
      .set({
        role: inv.role,
        status: 'active',
        name: parsed.name,
      })
      .where(eq(schema.user.email, inv.email.toLowerCase()));

    if (inv.role === 'admin' && inv.permissions.length > 0 && updatedUser) {
      await setUserPermissions(updatedUser.id, inv.permissions);
    }

    // Audit log
    await recordAuditEvent({
      actor: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
      },
      action: 'invitation.accepted',
      targetType: 'invitation',
      targetId: inv.id,
      targetSummary: `User ${updatedUser.name} accepted invitation as ${inv.role}`,
      details: {
        email: inv.email,
        role: inv.role,
      },
    });

    // Send welcome email via Resend
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.BETTER_AUTH_URL ||
      'http://localhost:3000';
    const loginUrl = inv.role === 'admin' ? `${appUrl}/auth/admin/login` : `${appUrl}/`;

    await sendWelcomeEmail({
      recipientEmail: inv.email,
      userName: parsed.name,
      role: inv.role === 'admin' ? 'Administrator' : 'Listener',
      loginUrl,
    });

    return {
      success: true,
      role: inv.role,
      loginUrl,
      message: 'Invitation accepted successfully! You can now sign in.',
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to accept invitation';
    return { success: false, error: msg };
  }
}

/**
 * Requests a password reset link for any user
 */
export async function requestPasswordResetAction(formData: unknown) {
  try {
    const parsed = RequestResetSchema.parse(formData);
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.BETTER_AUTH_URL ||
      'http://localhost:3000';
    const redirectTo = `${appUrl}/auth/reset-password`;

    const reqHeaders = await headers();

    // Trigger Better Auth's password reset flow which calls sendResetPassword (via Resend)
    await auth.api.requestPasswordReset({
      body: {
        email: parsed.email.trim().toLowerCase(),
        redirectTo,
      },
      headers: reqHeaders,
    });

    return {
      success: true,
      message: 'If an account exists with this email address, a password reset link has been dispatched.',
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to request password reset';
    return { success: false, error: msg };
  }
}

/**
 * Resets user password using the token received in the email
 */
export async function resetPasswordAction(formData: unknown) {
  try {
    const parsed = ResetPasswordSchema.parse(formData);
    const reqHeaders = await headers();

    const response = await auth.api.resetPassword({
      body: {
        token: parsed.token,
        newPassword: parsed.newPassword,
      },
      headers: reqHeaders,
    });

    if (!response) {
      throw new Error('Failed to reset password. The link may have expired or is invalid.');
    }

    return {
      success: true,
      message: 'Your password has been successfully reset. You may now sign in with your new credentials.',
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to reset password. Please try again or request a new reset link.';
    return { success: false, error: msg };
  }
}
