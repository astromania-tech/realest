'use client';

import { useState, useEffect, useCallback } from 'react';

interface EmailValidationResult {
  isValid: boolean;
  isAvailable: boolean;
  isLoading: boolean;
  error?: string;
  userInfo?: {
    firstName: string;
    status: 'active' | 'unsubscribed' | 'bounced';
    position?: number;
    totalCount?: number;
  };
}

interface UseEmailValidationOptions {
  debounceMs?: number;
  minLength?: number;
  validateOnMount?: boolean;
}

/**
 * Custom hook for real-time email validation with waitlist checking
 *
 * @param email - The email to validate
 * @param options - Configuration options
 * @returns EmailValidationResult with validation state and user info
 */
export function useEmailValidation(
  email: string,
  options: UseEmailValidationOptions = {}
): EmailValidationResult {
  const {
    debounceMs = 500,
    minLength = 3,
    validateOnMount = false
  } = options;

  const [isValid, setIsValid] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [userInfo, setUserInfo] = useState<EmailValidationResult['userInfo']>();

  // Email format validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validate email format
  const isEmailFormatValid = useCallback((email: string): boolean => {
    return emailRegex.test(email.trim());
  }, []);

  // Check if email exists in waitlist
  const checkEmailInWaitlist = useCallback(async (email: string): Promise<{
    exists: boolean;
    userInfo?: EmailValidationResult['userInfo'];
    error?: string;
  }> => {
    try {
      const response = await fetch(`/api/waitlist?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.exists) {
        return {
          exists: true,
          userInfo: {
            firstName: data.firstName,
            status: data.status,
            position: data.position,
            totalCount: data.totalCount
          }
        };
      }

      return { exists: false };

    } catch (error) {
      console.error('Email validation error:', error);
      return {
        exists: false,
        error: 'Unable to check email availability'
      };
    }
  }, []);

  // Debounced validation effect
  useEffect(() => {
    // Skip validation if email is too short or empty
    if (!email.trim() || email.length < minLength) {
      setIsValid(false);
      setIsAvailable(true);
      setIsLoading(false);
      setError(undefined);
      setUserInfo(undefined);
      return;
    }

    const timeoutId = setTimeout(async () => {
      // Reset states
      setError(undefined);
      setUserInfo(undefined);

      // Check email format first
      const formatValid = isEmailFormatValid(email);
      setIsValid(formatValid);

      if (!formatValid) {
        setIsAvailable(true);
        setIsLoading(false);
        return;
      }

      // Check if email exists in waitlist
      setIsLoading(true);

      const result = await checkEmailInWaitlist(email.trim());

      setIsLoading(false);

      // If there's an error, still mark as available but show error
      if (result.error) {
        setError(result.error);
        setIsAvailable(true); // Allow submission if API fails
        return;
      }

      const available = !result.exists;
      setIsAvailable(available);

      if (result.exists && result.userInfo) {
        setUserInfo(result.userInfo);
      }

    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [email, debounceMs, minLength, validateOnMount, isEmailFormatValid, checkEmailInWaitlist]);

  return {
    isValid,
    isAvailable,
    isLoading,
    error,
    userInfo
  };
}

/**
 * Hook for checking email without real-time validation
 * Useful for one-time checks or manual validation
 */
export function useEmailCheck() {
  const [isLoading, setIsLoading] = useState(false);

  const checkEmail = useCallback(async (email: string): Promise<EmailValidationResult> => {
    setIsLoading(true);

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(email.trim());

      if (!isValid) {
        return {
          isValid: false,
          isAvailable: true,
          isLoading: false,
          error: 'Please enter a valid email address'
        };
      }

      const response = await fetch(`/api/waitlist?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      const result: EmailValidationResult = {
        isValid: true,
        isAvailable: !data.exists,
        isLoading: false
      };

      if (data.exists) {
        result.userInfo = {
          firstName: data.firstName,
          status: data.status,
          position: data.position,
          totalCount: data.totalCount
        };
      }

      return result;

    } catch (error) {
      console.error('Email check error:', error);
      return {
        isValid: true,
        isAvailable: false,
        isLoading: false,
        error: 'Unable to verify email availability'
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { checkEmail, isLoading };
}

/**
 * Utility function to format waitlist position message
 */
export function formatWaitlistMessage(userInfo: EmailValidationResult['userInfo']): {
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning';
} {
  if (!userInfo) {
    return {
      title: 'Unknown Status',
      description: 'Unable to determine waitlist status',
      type: 'warning'
    };
  }

  const { firstName, status, position, totalCount } = userInfo;

  switch (status) {
    case 'active':
      return {
        title: `Welcome back, ${firstName}!`,
        description: position && totalCount
          ? `You're #${position} out of ${totalCount.toLocaleString()} people on our waitlist.`
          : "You're already on our waitlist and we'll notify you when we launch!",
        type: 'info'
      };

    case 'unsubscribed':
      return {
        title: `Hi ${firstName}`,
        description: "You previously unsubscribed from our waitlist. Would you like to rejoin?",
        type: 'warning'
      };

    case 'bounced':
      return {
        title: 'Email Issue',
        description: "We had trouble delivering emails to this address. Please check your email or use a different one.",
        type: 'warning'
      };

    default:
      return {
        title: 'Status Unknown',
        description: 'We found your email but the status is unclear. Please try again.',
        type: 'warning'
      };
  }
}
