// Create Nigerian phone number validation and formatting utilities

/**
 * Nigerian Phone Number Utilities
 *
 * Provides validation and formatting for Nigerian phone numbers.
 * Nigerian numbers follow the format: +234XXXXXXXXX (13 digits total)
 * Where XXXXXXXXX is 10 digits starting with 0 or the network code.
 */

export interface PhoneValidationResult {
  isValid: boolean;
  formatted?: string;
  error?: string;
}

/**
 * Validates a Nigerian phone number
 * @param phone - The phone number to validate
 * @returns boolean indicating if the phone number is valid
 */
export function validateNigerianPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;

  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Must start with +234
  if (!cleaned.startsWith('+234')) return false;

  // Must be exactly 13 characters (+234 + 9 digits after 0)
  if (cleaned.length !== 14) return false;

  // The digit after +234 should be 7, 8, 9, or 0 (Nigerian network codes)
  const networkCode = cleaned.charAt(4);
  if (!['7', '8', '9', '0'].includes(networkCode)) return false;

  return true;
}

/**
 * Formats a Nigerian phone number to standard format
 * @param phone - The phone number to format
 * @returns The formatted phone number or null if invalid
 */
export function formatNigerianPhone(phone: string): string | null {
  if (!phone || typeof phone !== 'string') return null;

  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // Handle different input formats
  if (cleaned.startsWith('234')) {
    // Already has 234, add +
    cleaned = '+' + cleaned;
  } else if (cleaned.startsWith('0')) {
    // Starts with 0, replace with +234
    cleaned = '+234' + cleaned.substring(1);
  } else if (cleaned.length === 10) {
    // Just 10 digits, assume Nigerian and add +234
    cleaned = '+234' + cleaned;
  } else if (!cleaned.startsWith('+234')) {
    // Doesn't start with +234, invalid
    return null;
  }

  // Validate the final format
  if (!validateNigerianPhone(cleaned)) return null;

  return cleaned;
}

/**
 * Normalizes a Nigerian phone number (removes formatting, ensures +234 prefix)
 * @param phone - The phone number to normalize
 * @returns The normalized phone number or null if invalid
 */
export function normalizeNigerianPhone(phone: string): string | null {
  return formatNigerianPhone(phone);
}

/**
 * Comprehensive validation with detailed result
 * @param phone - The phone number to validate
 * @returns PhoneValidationResult with validation details
 */
export function validateNigerianPhoneDetailed(phone: string): PhoneValidationResult {
  if (!phone || typeof phone !== 'string') {
    return {
      isValid: false,
      error: 'Phone number is required'
    };
  }

  const formatted = formatNigerianPhone(phone);

  if (!formatted) {
    return {
      isValid: false,
      error: 'Invalid Nigerian phone number format. Use +234XXXXXXXXX or 080XXXXXXXX'
    };
  }

  return {
    isValid: true,
    formatted
  };
}

/**
 * Extracts network provider from Nigerian phone number
 * @param phone - The phone number
 * @returns Network provider name or null
 */
export function getNigerianNetworkProvider(phone: string): string | null {
  const formatted = formatNigerianPhone(phone);
  if (!formatted) return null;

  const networkCode = formatted.charAt(4);

  const providers: Record<string, string> = {
    '7': 'Airtel',
    '8': 'MTN',
    '9': 'Glo',
    '0': 'Other'
  };

  return providers[networkCode] || 'Unknown';
}

/**
 * Checks if a phone number is a Nigerian mobile number
 * @param phone - The phone number
 * @returns boolean
 */
export function isNigerianMobile(phone: string): boolean {
  return validateNigerianPhone(phone);
}
