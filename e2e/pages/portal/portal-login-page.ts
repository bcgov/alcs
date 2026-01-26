import { type Locator, type Page } from '@playwright/test';

export class PortalLoginPage {
  readonly page: Page;
  readonly baseUrl: string;
  readonly loginButton: Locator;
  readonly userIdTextbox: Locator;
  readonly passwordTextbox: Locator;
  readonly continueButton: Locator;

  constructor(page: Page, baseUrl: string) {
    this.page = page;
    this.baseUrl = baseUrl;
    this.loginButton = page.getByRole('button', { name: 'Portal Login' });
    this.userIdTextbox = page.locator('#user');
    this.passwordTextbox = page.getByLabel('Password');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
  }

  async goto() {
    await this.page.goto(this.baseUrl);
  }

  async logIn(username: string, password: string) {
    // Click login and wait for navigation to external auth service
    // Use domcontentloaded since external auth services can be slow
    await Promise.all([
      this.page.waitForURL('**/auth/**', { timeout: 30000, waitUntil: 'domcontentloaded' }),
      this.loginButton.click(),
    ]);

    // Wait for login form to be ready
    await this.userIdTextbox.waitFor({ state: 'visible', timeout: 30000 });

    await this.userIdTextbox.fill(username);
    await this.passwordTextbox.fill(password);
    await this.continueButton.click();
  }
}
