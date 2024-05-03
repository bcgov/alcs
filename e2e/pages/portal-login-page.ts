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
    // There is an error with the username label on BCeID page
    this.userIdTextbox = page.getByRole('textbox').nth(0);
    this.passwordTextbox = page.getByLabel('Password');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
  }

  async goto() {
    await this.page.goto(this.baseUrl);
  }

  async logIn(username: string, password: string) {
    await this.loginButton.click();
    await this.userIdTextbox.fill(username);
    await this.passwordTextbox.fill(password);
    await this.continueButton.click();
  }
}
