import { EmailTemplateService } from './email-template.service';

describe('EmailTemplateService', () => {
  let service: EmailTemplateService;

  beforeEach(() => {
    service = new EmailTemplateService();
  });

  describe('generateEmailBase', () => {
    it('should generate an email base from a template and data', () => {
      const template = `<mjml><mj-body><mj-section><mj-column><mj-text>Hello {{name}}</mj-text></mj-column></mj-section></mj-body></mjml>`;
      const data = { name: 'John Smith' };
      const options = {};

      const result = service.generateEmailBase(template, data, options);

      expect(result.html).toBeDefined();
      expect(result.html).toContain('Hello John Smith');
    });
  });
});
