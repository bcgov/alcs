import { emailRegex } from './email.helper';

describe('emailRegex', () => {
  it('should match valid email addresses', () => {
    const validEmails = ['user@example.com', '22@22'];
    validEmails.forEach((email) => {
      expect(emailRegex.test(email)).toBe(true);
    });
  });

  it('should not match invalid email addresses', () => {
    const invalidEmails = ['user', '@example.com'];
    invalidEmails.forEach((email) => {
      expect(emailRegex.test(email)).toBe(false);
    });
  });
});
