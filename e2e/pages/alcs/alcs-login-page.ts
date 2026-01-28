import { type Locator, type Page } from '@playwright/test';

export class ALCSLoginPage {
  readonly page: Page;
  readonly baseUrl: string;
  readonly idirLink: Locator;
  readonly userIdTextbox: Locator;
  readonly passwordTextbox: Locator;
  readonly continueButton: Locator;

  constructor(page: Page, baseUrl: string) {
    this.page = page;
    this.baseUrl = baseUrl;
    this.idirLink = page.getByRole('link', { name: 'Basic or Business BCeID' });
    this.userIdTextbox = page.locator('#user');
    this.passwordTextbox = page.getByLabel('Password');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
  }

  async goto() {
    await this.page.goto(this.baseUrl);
  }

  async login(username: string, password: string) {
    // Click IDIR link - Playwright auto-waits for navigation
    await this.idirLink.click();
    
    // Fill username - Playwright automatically waits for:
    // - Element to appear after SAML redirects
    // - Element to be visible, enabled, and stable
    // - Navigation to complete
    await this.userIdTextbox.fill(username);
    await this.passwordTextbox.fill(password);
    await this.continueButton.click();
  }
}
