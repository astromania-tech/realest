type AuthError = { code?: string; message: string } | null;

export type PasswordChangeAuth = {
  getUser: () => Promise<{
    data: { user: { email?: string | null } | null };
    error: AuthError;
  }>;
  signInWithPassword: (credentials: {
    email: string;
    password: string;
  }) => Promise<{ error: AuthError }>;
  updateUser: (attributes: { password: string }) => Promise<{
    error: AuthError;
  }>;
};

export type PasswordChangeResult =
  | { success: true }
  | { success: false; error: string };

export async function changePasswordWithCurrentPassword(
  auth: PasswordChangeAuth,
  currentPassword: string,
  newPassword: string,
): Promise<PasswordChangeResult> {
  if (currentPassword === newPassword) {
    return {
      success: false,
      error: "Your new password must be different from your current password.",
    };
  }

  const {
    data: { user },
    error: userError,
  } = await auth.getUser();

  if (userError || !user?.email) {
    return {
      success: false,
      error: "Your session has expired. Sign in again before changing your password.",
    };
  }

  const { error: verificationError } = await auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (verificationError) {
    const invalidCredentials =
      verificationError.code === "invalid_credentials" ||
      /invalid login credentials|invalid credentials/i.test(
        verificationError.message,
      );
    return {
      success: false,
      error: invalidCredentials
        ? "Your current password is incorrect."
        : "We could not verify your current password. Please try again.",
    };
  }

  const { error: updateError } = await auth.updateUser({ password: newPassword });

  if (!updateError) return { success: true };

  if (
    updateError.code === "same_password" ||
    /same password|different from your current password/i.test(
      updateError.message,
    )
  ) {
    return {
      success: false,
      error: "Your new password must be different from your current password.",
    };
  }

  if (
    updateError.code === "weak_password" ||
    /weak password|password.*(weak|short|strong|characters)/i.test(
      updateError.message,
    )
  ) {
    return {
      success: false,
      error:
        "Use at least 8 characters, including uppercase, lowercase, a number, and a symbol.",
    };
  }

  return {
    success: false,
    error: "We could not update your password. Please try again.",
  };
}
