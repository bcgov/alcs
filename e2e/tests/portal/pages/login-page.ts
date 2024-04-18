import { type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly loginButton: Locator;
  readonly userIdTextField: Locator;
  readonly passwordTextField: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginButton = page.getByRole('button', { name: 'Portal Login' });
    // There is an error with the username label on BCeID page
    this.userIdTextField = page.getByRole('textbox').nth(0);
    this.passwordTextField = page.getByLabel('Password');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
  }

  async goto() {
    await this.page.goto('/');
  }

  async logIn(username: string, password: string) {
    await this.loginButton.click();
    await this.userIdTextField.fill(username);
    await this.passwordTextField.fill(password);
    await this.continueButton.click();
  }
}
