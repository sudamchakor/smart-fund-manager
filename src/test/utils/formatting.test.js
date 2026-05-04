import * as formatting from '../../../src/utils/formatting';

describe('Formatting Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format currency with default Indian Rupee symbol', () => {
      expect(formatting.formatCurrency(123456.78)).toBe('₹1,23,457');
    });

    it('should format currency with custom symbol', () => {
      expect(formatting.formatCurrency(1234.56, 'USD')).toBe('$1,235');
    });

    it('should handle zero value', () => {
      expect(formatting.formatCurrency(0)).toBe('₹0');
    });

    it('should handle negative value', () => {
      expect(formatting.formatCurrency(-123.45)).toBe('-₹123');
    });

    it('should handle large numbers', () => {
      expect(formatting.formatCurrency(1234567890.12)).toBe('₹1,23,45,67,890');
    });

    it('should handle non-numeric input gracefully', () => {
      expect(formatting.formatCurrency(null)).toBe('₹0');
      expect(formatting.formatCurrency(undefined)).toBe('₹0');
      expect(formatting.formatCurrency('abc')).toBe('₹0');
    });
  });

  describe.skip('formatPercentage', () => {
    it('should format percentage with two decimal places', () => {
      expect(formatting.formatPercentage(0.12345)).toBe('12.35%');
    });

    it('should format percentage with custom decimal places', () => {
      expect(formatting.formatPercentage(0.12345, 1)).toBe('12.3%');
    });

    it('should handle zero value', () => {
      expect(formatting.formatPercentage(0)).toBe('0.00%');
    });

    it('should handle whole numbers', () => {
      expect(formatting.formatPercentage(1)).toBe('100.00%');
    });

    it('should handle non-numeric input gracefully', () => {
      expect(formatting.formatPercentage(null)).toBe('0.00%');
      expect(formatting.formatPercentage(undefined)).toBe('0.00%');
      expect(formatting.formatPercentage('xyz')).toBe('0.00%');
    });
  });

  describe.skip('formatNumber', () => {
    it('should format number with Indian locale by default', () => {
      expect(formatting.formatNumber(1234567.89)).toBe('12,34,567.89');
    });

    it('should format number with custom locale options', () => {
      expect(formatting.formatNumber(12345.67, { style: 'decimal', minimumFractionDigits: 0 })).toBe('12,346');
    });

    it('should handle zero', () => {
      expect(formatting.formatNumber(0)).toBe('0');
    });

    it('should handle negative numbers', () => {
      expect(formatting.formatNumber(-1234.5)).toBe('-1,234.5');
    });

    it('should handle non-numeric input gracefully', () => {
      expect(formatting.formatNumber(null)).toBe('0');
      expect(formatting.formatNumber(undefined)).toBe('0');
      expect(formatting.formatNumber('abc')).toBe('0');
    });
  });

  describe.skip('formatDate', () => {
    it('should format date to "DD Mon, YYYY" by default', () => {
      const date = new Date('2023-01-15T10:00:00Z');
      expect(formatting.formatDate(date)).toBe('15 Jan, 2023');
    });

    it('should handle invalid date input', () => {
      expect(formatting.formatDate('invalid date')).toBe('Invalid Date');
      expect(formatting.formatDate(null)).toBe('Invalid Date');
    });

    it('should format date with custom options', () => {
      const date = new Date('2023-01-15T10:00:00Z');
      expect(formatting.formatDate(date, { weekday: 'long' })).toBe('Sunday');
    });
  });

  describe.skip('capitalizeFirstLetter', () => {
    it('should capitalize the first letter of a string', () => {
      expect(formatting.capitalizeFirstLetter('hello')).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(formatting.capitalizeFirstLetter('')).toBe('');
    });

    it('should handle string with single letter', () => {
      expect(formatting.capitalizeFirstLetter('a')).toBe('A');
    });

    it('should handle string with leading spaces', () => {
      expect(formatting.capitalizeFirstLetter('  word')).toBe('  word'); // Should not trim
    });

    it('should handle non-string input gracefully', () => {
      expect(formatting.capitalizeFirstLetter(null)).toBe('');
      expect(formatting.capitalizeFirstLetter(undefined)).toBe('');
      expect(formatting.capitalizeFirstLetter(123)).toBe('123'); // Numbers are converted to string
    });
  });

  describe.skip('truncateText', () => {
    it('should truncate text longer than max length', () => {
      expect(formatting.truncateText('This is a long text', 10)).toBe('This is a...');
    });

    it('should not truncate text shorter than max length', () => {
      expect(formatting.truncateText('Short text', 15)).toBe('Short text');
    });

    it('should handle empty string', () => {
      expect(formatting.truncateText('', 10)).toBe('');
    });

    it('should handle max length less than 3', () => {
      expect(formatting.truncateText('Text', 2)).toBe('T..'); // Default ellipsis length is 3, so min length is 3
    });

    it('should handle non-string input gracefully', () => {
      expect(formatting.truncateText(null, 10)).toBe('');
      expect(formatting.truncateText(undefined, 10)).toBe('');
      expect(formatting.truncateText(12345, 3)).toBe('12...');
    });
  });

  describe.skip('getInitials', () => {
    it('should return initials for a full name', () => {
      expect(formatting.getInitials('John Doe')).toBe('JD');
    });

    it('should return initial for a single name', () => {
      expect(formatting.getInitials('John')).toBe('J');
    });

    it('should handle multiple spaces', () => {
      expect(formatting.getInitials('  John   Doe  ')).toBe('JD');
    });

    it('should handle empty string', () => {
      expect(formatting.getInitials('')).toBe('');
    });

    it('should handle non-string input gracefully', () => {
      expect(formatting.getInitials(null)).toBe('');
      expect(formatting.getInitials(undefined)).toBe('');
      expect(formatting.getInitials(123)).toBe('1'); // Converts to string "123" -> "1"
    });
  });

  describe.skip('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(formatting.isValidEmail('test@example.com')).toBe(true);
      expect(formatting.isValidEmail('john.doe123@sub.domain.co.in')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(formatting.isValidEmail('invalid-email')).toBe(false);
      expect(formatting.isValidEmail('test@.com')).toBe(false);
      expect(formatting.isValidEmail('@example.com')).toBe(false);
      expect(formatting.isValidEmail('test@example')).toBe(false);
      expect(formatting.isValidEmail(null)).toBe(false);
      expect(formatting.isValidEmail(undefined)).toBe(false);
      expect(formatting.isValidEmail(123)).toBe(false);
    });
  });

  describe.skip('isValidPhoneNumber', () => {
    it('should return true for valid 10-digit phone numbers', () => {
      expect(formatting.isValidPhoneNumber('1234567890')).toBe(true);
      expect(formatting.isValidPhoneNumber('9876543210')).toBe(true);
    });

    it('should return false for invalid phone numbers', () => {
      expect(formatting.isValidPhoneNumber('12345')).toBe(false);
      expect(formatting.isValidPhoneNumber('12345678901')).toBe(false);
      expect(formatting.isValidPhoneNumber('abc1234567')).toBe(false);
      expect(formatting.isValidPhoneNumber(null)).toBe(false);
      expect(formatting.isValidPhoneNumber(undefined)).toBe(false);
      expect(formatting.isValidPhoneNumber(1234567890)).toBe(false); // Should be string
    });
  });

  describe.skip('isValidPassword', () => {
    it('should return true for valid passwords (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)', () => {
      expect(formatting.isValidPassword('Password123!')).toBe(true);
      expect(formatting.isValidPassword('P@ssw0rd1')).toBe(true);
    });

    it('should return false for invalid passwords', () => {
      expect(formatting.isValidPassword('password123')).toBe(false); // No uppercase
      expect(formatting.isValidPassword('PASSWORD123')).toBe(false); // No lowercase
      expect(formatting.isValidPassword('Password!!')).toBe(false); // No number
      expect(formatting.isValidPassword('Password123')).toBe(false); // No special char
      expect(formatting.isValidPassword('P@ss1')).toBe(false); // Too short
      expect(formatting.isValidPassword(null)).toBe(false);
      expect(formatting.isValidPassword(undefined)).toBe(false);
      expect(formatting.isValidPassword(12345678)).toBe(false);
    });
  });

  describe.skip('calculateReadingTime', () => {
    it('should calculate reading time for a given text', () => {
      const shortText = 'This is a short text.'; // 5 words
      expect(formatting.calculateReadingTime(shortText)).toBe(1); // Assuming 200 words per minute

      const longText = 'Word '.repeat(200); // 200 words
      expect(formatting.calculateReadingTime(longText)).toBe(1);

      const veryLongText = 'Word '.repeat(300); // 300 words
      expect(formatting.calculateReadingTime(veryLongText)).toBe(2);
    });

    it('should return 1 for empty or very short text', () => {
      expect(formatting.calculateReadingTime('')).toBe(1);
      expect(formatting.calculateReadingTime('Hello')).toBe(1);
      expect(formatting.calculateReadingTime(null)).toBe(1);
      expect(formatting.calculateReadingTime(undefined)).toBe(1);
    });

    it('should handle non-string input gracefully', () => {
      expect(formatting.calculateReadingTime(12345)).toBe(1);
    });
  });
});