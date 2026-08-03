// Validation and Formatting Utilities for NovaWash / NovaWash

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
  let cleaned = val.toUpperCase().replace(/[^A-Z0-9\s.\-]/g, '');
  
  // Extract raw alphanumeric string
  let raw = cleaned.replace(/[^A-Z0-9]/g, '');
  if (raw.length === 0) return '';
  
  // First 2 chars are always the province digits
  let formatted = raw.slice(0, 2);
  if (raw.length <= 2) return formatted;
  
  // Determine prefixLength:
  // prefixLength = 3 means 1-char series (e.g. 29H -> 29H-123.45)
  // prefixLength = 4 means 2-char series (e.g. 85-H1 -> 85-H1 234.56 or 50-AA -> 50-AA 123.45)
  let prefixLength = 3;
  
  if (raw.length > 3) {
    const char3 = raw.charAt(3); // 4th character of raw (index 3)
    
    // 1. If raw has 9 or more characters (e.g. 85H123456 -> 2 province + 2 series + 5 numbers),
    // it MUST be a 2-char series plate (85-H1 234.56) because max number digits is 5.
    if (raw.length >= 9) {
      prefixLength = 4;
    }
    // 2. If 4th character of raw is a Letter (e.g. 50AA..., 85HP...), series is 2 letters.
    else if (/[A-Z]/.test(char3)) {
      prefixLength = 4;
    }
    // 3. If user explicitly typed a hyphen after province (e.g. "85-H1..."),
    // check if 'cleaned' starts with 2 digits followed by '-' or ' '
    else if (/^[0-9]{2}[\s.\-]/.test(cleaned) && raw.length >= 4) {
      prefixLength = 4;
    }
    // 4. If user explicitly typed space/hyphen after 2 series chars (e.g. "85H1 123"),
    // check if there is a separator after the 4th raw character in 'cleaned'
    else if (raw.length >= 5) {
      let rawCount = 0;
      let idx4 = -1;
      for (let i = 0; i < cleaned.length; i++) {
        if (/[A-Z0-9]/.test(cleaned[i])) {
          rawCount++;
          if (rawCount === 4) {
            idx4 = i;
            break;
          }
        }
      }
      if (idx4 !== -1 && idx4 + 1 < cleaned.length && /[\s.\-]/.test(cleaned[idx4 + 1])) {
        prefixLength = 4;
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

