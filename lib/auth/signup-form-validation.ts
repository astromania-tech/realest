import { isPasswordValid } from "./password-rules.ts";

export type SignupField = "email" | "password" | "confirmPassword";
export type SignupFieldErrors = Partial<Record<SignupField, string>>;

export type SignupFieldValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

export function validateSignupFields({
  email,
  password,
  confirmPassword,
}: SignupFieldValues): SignupFieldErrors {
  const errors: SignupFieldErrors = {};
  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    errors.email = "Enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Enter a password.";
  } else if (!isPasswordValid(password)) {
    errors.password =
      "Use at least 8 characters, including uppercase, lowercase, a number, and a symbol.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export function signupApiFieldError(
  rawMessage?: string,
): { field: SignupField; message: string } | null {
  const message = rawMessage?.toLowerCase() ?? "";

  if (
    /email_exists|already registered|already exists|user already registered/.test(
      message,
    )
  ) {
    return {
      field: "email",
      message: "An account with this email already exists. Sign in or use another email.",
    };
  }

  if (/invalid.*email|email.*invalid|valid email address/.test(message)) {
    return { field: "email", message: "Enter a valid email address." };
  }

  if (
    /weak password|password.*(weak|short|strong|characters|security requirements)/.test(
      message,
    )
  ) {
    return {
      field: "password",
      message:
        "Use at least 8 characters, including uppercase, lowercase, a number, and a symbol.",
    };
  }

  return null;
}
