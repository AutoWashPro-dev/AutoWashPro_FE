// Validation and Formatting Utilities for NovaWash / AutoWash Pro

/**
 * Strips non-numeric characters and limits to 10 digits
 */
export const cleanPhoneNumber = (val) => {
  if (!val) return '';
  const cleaned = val.replace(/\D/g, '');
  return cleaned.slice(0, 10);
};

/**
 * Validates Vietnamese Phone Numbers
 * Must start with standard prefixes (03, 05, 07, 08, 09) and consist of exactly 10 digits.
 */
export const validatePhoneNumber = (val) => {
  if (!val) return false;
  const regex = /^(03|05|07|08|09)\d{8}$/;
  return regex.test(val);
};

/**
 * Validates Gmail Format
 * Must strictly end with @gmail.com
 */
export const validateGmail = (val) => {
  if (!val) return false;
  const regex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
  return regex.test(val);
};

/**
 * Formats Vietnamese License Plates as typed
 * Supports standard Vietnamese plate formats including space/hyphen/dot placements:
 * - Motorcycle: e.g. 50-AA 379.79, 50-AG 034.56, 59-A1 123.45
 * - Car/Motorcycle: e.g. 29H-666.66, 30H-567.89
 * - Legacy 4-digit: e.g. 29H-6666, 50-A1 1234
 */
export const formatLicensePlate = (val) => {
  if (!val) return '';
  
  // Clean input: uppercase, keep only letters, numbers, hyphens, spaces, and dots
  let cleaned = val.toUpperCase().replace(/[^A-Z0-9\s.-]/g, '');
  
  // Extract raw alphanumeric string
  let raw = cleaned.replace(/[^A-Z0-9]/g, '');
  if (raw.length === 0) return '';
  
  let formatted = raw.slice(0, 2);
  if (raw.length <= 2) return formatted;
  
  // Determine if series part is 2 chars (e.g. AA, A1) or 1 char (e.g. H)
  let prefixLength = 3;
  if (raw.length > 3) {
    const char3 = raw.charAt(3);
    
    // Check original input for user intent: manual space or hyphen
    const firstLetterIdx = cleaned.search(/[A-Z]/);
    if (firstLetterIdx !== -1) {
      if (cleaned.charAt(firstLetterIdx + 1) === ' ' || cleaned.charAt(firstLetterIdx + 1) === '-') {
        prefixLength = 3;
      } else if (cleaned.charAt(firstLetterIdx + 2) === ' ' || cleaned.charAt(firstLetterIdx + 2) === '-') {
        prefixLength = 4;
      } else {
        // No manual separator, infer from string structure
        if (/[A-Z]/.test(char3)) {
          prefixLength = 4; // e.g. AA, AG
        } else {
          // char3 is a digit.
          // If raw length is 9, it must be 59-A1 123.45 (prefix length 4)
          if (raw.length === 9) {
            prefixLength = 4;
          } else if (raw.length === 8) {
            // If length is 8, can be 50-A1 1234 (prefix 4) or 29H-666.66 (prefix 3)
            // Check if last 5 characters are all digits
            const last5AreDigits = /^\d{5}$/.test(raw.slice(3));
            if (last5AreDigits) {
              prefixLength = 3;
            } else {
              prefixLength = 4;
            }
          } else {
            prefixLength = 3;
          }
        }
      }
    }
  }
  
  if (prefixLength === 4) {
    formatted += '-' + raw.slice(2, 4);
    if (raw.length > 4) {
      formatted += ' ' + formatNumberPart(raw.slice(4));
    }
  } else {
    formatted += raw.charAt(2);
    if (raw.length > 3) {
      formatted += '-' + formatNumberPart(raw.slice(3));
    }
  }
  
  return formatted;
};

const formatNumberPart = (num) => {
  const digits = num.slice(0, 5);
  if (digits.length <= 4) {
    return digits;
  } else {
    // If 5 digits, insert dot before the last 2 digits
    return digits.slice(0, 3) + '.' + digits.slice(3);
  }
};

/**
 * Validates Vietnamese License Plates
 * Flexible regex supporting optional space/hyphen and dot:
 * /^([0-9]{2}[A-Z0-9]{1,2}|[0-9]{2}-[A-Z0-9]{2})[\s\-]?([0-9]{3}\.[0-9]{2}|[0-9]{4,5})$/i
 */
export const validateLicensePlate = (val) => {
  if (!val) return false;
  const regex = /^([0-9]{2}[A-Z0-9]{1,2}|[0-9]{2}-[A-Z0-9]{2})[\s\-]?([0-9]{3}\.[0-9]{2}|[0-9]{4,5})$/i;
  return regex.test(val);
};
