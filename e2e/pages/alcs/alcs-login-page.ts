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
    // Click IDIR link - navigation will happen through SAML redirects
    await this.idirLink.click();
    
    // Wait for the login form to appear (more reliable than URL matching for SAML redirects)
    // The form appears after all SAML redirects complete
    await this.userIdTextbox.waitFor({ state: 'visible', timeout: 60000 });

    await this.userIdTextbox.fill(username);
    await this.passwordTextbox.fill(password);
    await this.continueButton.click();
  }
}
